Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { categoryId, prizeNames, winnerCount = 1 } = await req.json();

        if (!categoryId) {
            throw new Error('分类ID是必需的');
        }

        if (!prizeNames || !Array.isArray(prizeNames) || prizeNames.length === 0) {
            throw new Error('奖品名称列表是必需的');
        }

        if (winnerCount <= 0) {
            throw new Error('中奖人数必须大于0');
        }

        // 获取Supabase配置
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase配置缺失');
        }

        // 获取指定分类的所有可用参与者
        const participantsResponse = await fetch(`${supabaseUrl}/rest/v1/participants?category_id=eq.${categoryId}&is_active=eq.true&select=*`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!participantsResponse.ok) {
            const errorText = await participantsResponse.text();
            throw new Error(`获取参与者失败: ${errorText}`);
        }

        const participants = await participantsResponse.json();

        if (!participants || participants.length === 0) {
            throw new Error('该分类下没有可用的参与者');
        }

        if (participants.length < winnerCount) {
            throw new Error(`参与者数量(${participants.length})少于所需中奖人数(${winnerCount})`);
        }

        // 执行随机抽奖算法
        const shuffled = [...participants];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const winners = shuffled.slice(0, winnerCount);
        const lotteryDate = new Date().toISOString();

        // 创建抽奖记录
        const lotteryRecords = winners.map((winner, index) => ({
            category_id: categoryId,
            participant_id: winner.id,
            participant_name: winner.name,
            prize_name: prizeNames[index % prizeNames.length], // 循环使用奖品名称
            lottery_date: lotteryDate
        }));

        // 保存抽奖记录到数据库
        const recordsResponse = await fetch(`${supabaseUrl}/rest/v1/lottery_records`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(lotteryRecords)
        });

        if (!recordsResponse.ok) {
            const errorText = await recordsResponse.text();
            throw new Error(`保存抽奖记录失败: ${errorText}`);
        }

        const savedRecords = await recordsResponse.json();

        // 返回抽奖结果
        const result = {
            data: {
                winners: winners.map((winner, index) => ({
                    id: winner.id,
                    name: winner.name,
                    prizeName: prizeNames[index % prizeNames.length],
                    lotteryDate: lotteryDate
                })),
                totalParticipants: participants.length,
                categoryId: categoryId,
                lotteryRecords: savedRecords
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('抽奖错误:', error);

        const errorResponse = {
            error: {
                code: 'LOTTERY_DRAW_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});