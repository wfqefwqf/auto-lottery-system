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
        const { csvData, categoryId } = await req.json();

        if (!csvData) {
            throw new Error('CSV数据是必需的');
        }

        // 获取Supabase配置
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase配置缺失');
        }

        // 解析CSV数据
        const lines = csvData.trim().split('\n');
        if (lines.length <= 1) {
            throw new Error('CSV文件必须包含标题行和至少一行数据');
        }

        // 跳过标题行，解析数据行
        const participants = [];
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            try {
                // 简单的CSV解析（处理双引号包围的字段）
                const fields = [];
                let current = '';
                let inQuotes = false;
                
                for (let j = 0; j < line.length; j++) {
                    const char = line[j];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        fields.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                fields.push(current.trim());

                // 验证必需字段
                const name = fields[0]?.replace(/^"|"$/g, '').trim();
                if (!name) {
                    errors.push(`第${i + 1}行: 姓名不能为空`);
                    continue;
                }

                const participant = {
                    name: name,
                    category_id: categoryId || (fields[1]?.replace(/^"|"$/g, '').trim() || null),
                    is_active: true
                };

                participants.push(participant);

            } catch (error) {
                errors.push(`第${i + 1}行: 解析错误 - ${error.message}`);
            }
        }

        if (participants.length === 0) {
            throw new Error('没有有效的参与者数据可导入');
        }

        // 批量插入参与者数据
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/participants`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(participants)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`插入参与者数据失败: ${errorText}`);
        }

        const insertedParticipants = await insertResponse.json();

        const result = {
            data: {
                imported: insertedParticipants.length,
                total: lines.length - 1,
                errors: errors,
                participants: insertedParticipants
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('导入错误:', error);

        const errorResponse = {
            error: {
                code: 'IMPORT_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});