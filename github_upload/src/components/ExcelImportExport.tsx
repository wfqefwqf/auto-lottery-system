import React, { useState } from 'react';
import { Upload, Download, FileText, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const ExcelImportExport: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel' &&
          !file.name.endsWith('.xlsx') &&
          !file.name.endsWith('.xls') &&
          !file.name.endsWith('.csv')) {
        toast.error('请选择Excel文件(.xlsx, .xls)或CSV文件');
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const parseExcelFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // 转换为CSV格式
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          resolve(csv);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImportParticipants = async () => {
    if (!selectedFile) {
      toast.error('请选择要导入的文件');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      let csvData: string;
      
      if (selectedFile.name.endsWith('.csv')) {
        // 处理CSV文件
        csvData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('文件读取失败'));
          reader.readAsText(selectedFile, 'UTF-8');
        });
      } else {
        // 处理Excel文件
        csvData = await parseExcelFile(selectedFile);
      }

      const { data, error } = await supabase.functions.invoke('import-participants', {
        body: {
          csvData: csvData
        }
      });

      if (error) throw error;

      setImportResult(data.data);
      toast.success(`导入成功！共导入${data.data.imported}个参与者`);
      
    } catch (error: any) {
      toast.error(`导入失败: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleExportParticipants = async () => {
    setExporting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('export-excel', {
        body: {
          type: 'participants'
        }
      });

      if (error) throw error;

      // 创建下载链接
      const blob = new Blob([atob(data.data.content)], { type: data.data.mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = data.data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('导出成功');
    } catch (error: any) {
      toast.error(`导出失败: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ['姓名', '分类ID'],
      ['张三', ''],
      ['李四', ''],
      ['王五', '']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '参与者模板');
    
    XLSX.writeFile(wb, '参与者导入模板.xlsx');
    toast.success('模板下载成功');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Excel 导入导出
        </h2>
        <p className="text-gray-600 mt-1">批量导入导出参与者数据</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 导入区域 */}
        <div className="fluent-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Upload className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">导入参与者</h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            支持Excel (.xlsx, .xls) 和 CSV 文件格式
          </p>

          {/* 文件选择 */}
          <div className="mb-4">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="fluent-button-secondary w-full flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              选择文件
            </label>
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                已选择: {selectedFile.name}
              </p>
            )}
          </div>

          {/* 导入按钮 */}
          <button
            onClick={handleImportParticipants}
            disabled={!selectedFile || importing}
            className="fluent-button w-full flex items-center justify-center gap-2 mb-4"
          >
            {importing ? (
              <>
                <div className="loading-spinner w-4 h-4"></div>
                导入中...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                开始导入
              </>
            )}
          </button>

          {/* 下载模板 */}
          <button
            onClick={downloadTemplate}
            className="fluent-button-secondary w-full flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            下载导入模板
          </button>

          {/* 导入说明 */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">导入说明：</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• 第一行必须是标题行</li>
              <li>• 姓名列为必填项</li>
              <li>• 分类ID可以为空，表示未分类</li>
              <li>• 建议使用模板格式</li>
            </ul>
          </div>
        </div>

        {/* 导出区域 */}
        <div className="fluent-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">导出数据</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            导出当前所有参与者数据为 CSV 文件
          </p>

          <button
            onClick={handleExportParticipants}
            disabled={exporting}
            className="fluent-button w-full flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <div className="loading-spinner w-4 h-4"></div>
                导出中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                导出参与者数据
              </>
            )}
          </button>

          {/* 导出说明 */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">导出说明：</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 导出所有参与者的基本信息</li>
              <li>• 包含姓名、分类等信息</li>
              <li>• 文件格式为 CSV，支持中文</li>
              <li>• 可用 Excel 或其他表格软件打开</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 导入结果 */}
      {importResult && (
        <div className="mt-6 fluent-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            导入结果
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
              <div className="text-sm text-green-700">成功导入</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{importResult.total}</div>
              <div className="text-sm text-blue-700">总记录数</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{importResult.errors?.length || 0}</div>
              <div className="text-sm text-red-700">错误数量</div>
            </div>
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-red-900 mb-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                错误详情：
              </h4>
              <div className="bg-red-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                {importResult.errors.map((error: string, index: number) => (
                  <p key={index} className="text-xs text-red-800 mb-1">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExcelImportExport;