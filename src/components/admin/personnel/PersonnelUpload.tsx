'use client';

import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Check, AlertCircle, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: string | number;
}

interface PreviewItem {
  companyName: string;
  personName: string;
  position: string | null;
  department: string | null;
  changeType: string;
  previousPosition: string | null;
  announcedAt: Date;
}

interface PreviewData {
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: ValidationError[];
  preview: PreviewItem[];
}

type UploadStep = 'upload' | 'preview' | 'confirm' | 'success';

export function PersonnelUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<UploadStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'merge' | 'replace'>('merge');
  const [result, setResult] = useState<{ totalRows: number } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('action', 'preview');

      const res = await fetch('/api/admin/personnel/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setPreviewData(data.data);
        setStep('preview');
      } else {
        alert(data.error || '파일 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('파일 처리 실패:', error);
      alert('파일 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'confirm');
      formData.append('mode', uploadMode);

      const res = await fetch('/api/admin/personnel/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setStep('success');
      } else {
        alert(data.error || '업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setPreviewData(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await fetch('/api/admin/personnel/template');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `인사정보_업로드_템플릿_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('템플릿 다운로드 실패:', error);
      alert('템플릿 다운로드에 실패했습니다.');
    }
  };

  const CHANGE_TYPE_LABELS: Record<string, string> = {
    APPOINTMENT: '신규 임명',
    PROMOTION: '승진',
    TRANSFER: '전보',
    RESIGNATION: '사임/퇴직',
    RETIREMENT: '정년퇴직',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Step: Upload */}
      {step === 'upload' && (
        <div className="text-center">
          <div className="mb-6">
            <FileSpreadsheet className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              인사정보 엑셀 업로드
            </h3>
            <p className="text-gray-500">
              엑셀 파일(.xlsx, .xls)을 업로드하여 인사정보를 일괄 등록할 수 있습니다.
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              템플릿 다운로드
            </Button>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-1">클릭하여 파일 선택</p>
            <p className="text-sm text-gray-400">또는 파일을 여기에 드래그</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />

          {loading && (
            <div className="mt-4 flex items-center justify-center text-gray-600">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
              파일 분석 중...
            </div>
          )}
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && previewData && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">업로드 미리보기</h3>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="h-4 w-4 mr-1" />
              취소
            </Button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{previewData.totalRows}</div>
              <div className="text-sm text-gray-500">전체 행</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{previewData.validRows}</div>
              <div className="text-sm text-gray-500">유효</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{previewData.errorRows}</div>
              <div className="text-sm text-gray-500">오류</div>
            </div>
          </div>

          {/* Errors */}
          {previewData.errors.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                검증 오류
              </h4>
              <div className="bg-red-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                {previewData.errors.map((error, idx) => (
                  <div key={idx} className="text-sm text-red-700 mb-1">
                    행 {error.row}: [{error.field}] {error.message}
                    {error.value && ` (값: ${error.value})`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Table */}
          {previewData.preview.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">데이터 미리보기 (최대 10건)</h4>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">증권사</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">인물명</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">직책</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">변동유형</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {previewData.preview.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">{item.companyName}</td>
                        <td className="px-3 py-2">{item.personName}</td>
                        <td className="px-3 py-2">{item.position || '-'}</td>
                        <td className="px-3 py-2">{CHANGE_TYPE_LABELS[item.changeType] || item.changeType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mode Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">업로드 모드</h4>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadMode"
                  value="merge"
                  checked={uploadMode === 'merge'}
                  onChange={() => setUploadMode('merge')}
                  className="text-blue-500"
                />
                <span className="text-sm">추가 (기존 데이터 유지)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadMode"
                  value="replace"
                  checked={uploadMode === 'replace'}
                  onChange={() => setUploadMode('replace')}
                  className="text-blue-500"
                />
                <span className="text-sm text-red-600">교체 (엑셀 업로드 데이터만 삭제 후 새로 등록)</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleReset}>
              취소
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || previewData.errorRows > 0}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  업로드 중...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {previewData.validRows}건 업로드
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && result && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            업로드 완료
          </h3>
          <p className="text-gray-500 mb-6">
            {result.totalRows}건의 인사정보가 성공적으로 등록되었습니다.
          </p>
          <Button onClick={handleReset}>
            새 파일 업로드
          </Button>
        </div>
      )}
    </div>
  );
}
