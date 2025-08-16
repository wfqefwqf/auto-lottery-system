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
        const { type = 'participants', categoryId } = await req.json();

        // 获取Supabase配置
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase配置缺失');
        }

        let csvData = '';
        let filename = '';

        if (type === 'participants') {
            // 导出参与者数据
            let url = `${supabaseUrl}/rest/v1/participants?select=*`;
            if (categoryId) {
                url += `&category_id=eq.${categoryId}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`获取参与者数据失败: ${errorText}`);
            }

            const participants = await response.json();

            // 创建CSV格式数据
            csvData = '姓名,分类ID,是否启用,创建时间\n';
            participants.forEach(participant => {
                csvData += `"${participant.name}","${participant.category_id || ''}","${participant.is_active ? '是' : '否'}","${new Date(participant.created_at).toLocaleString('zh-CN')}"\n`;
            });

            filename = `participants_${new Date().toISOString().split('T')[0]}.csv`;

        } else if (type === 'lottery_records') {
            // 导出抽奖记录
            let url = `${supabaseUrl}/rest/v1/lottery_records?select=*`;
            if (categoryId) {
                url += `&category_id=eq.${categoryId}`;
            }
            url += '&order=lottery_date.desc';

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`获取抽奖记录失败: ${errorText}`);
            }

            const records = await response.json();

            // 创建CSV格式数据
            csvData = '中奖者姓名,奖品名称,抽奖时间,分类ID,参与者ID\n';
            records.forEach(record => {
                csvData += `"${record.participant_name}","${record.prize_name}","${new Date(record.lottery_date).toLocaleString('zh-CN')}","${record.category_id || ''}","${record.participant_id || ''}"\n`;
            });

            filename = `lottery_records_${new Date().toISOString().split('T')[0]}.csv`;

        } else {
            throw new Error('不支持的导出类型');
        }

        // 将CSV转换为Base64
        const encoder = new TextEncoder();
        const csvBytes = encoder.encode('\uFEFF' + csvData); // 添加BOM以支持中文
        const base64Data = btoa(String.fromCharCode(...csvBytes));

        const result = {
            data: {
                filename: filename,
                content: base64Data,
                mimeType: 'text/csv;charset=utf-8',
                encoding: 'base64'
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('导出错误:', error);

        const errorResponse = {
            error: {
                code: 'EXPORT_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});