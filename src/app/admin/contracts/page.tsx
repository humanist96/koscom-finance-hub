'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: string | number;
}

interface PreviewContract {
  companyId: string;
  companyName: string;
  orderNumber: number;
  category: string;
  customerType: string;
  currentRevenue: number | null;
  powerbaseRevenue: number | null;
  year2025Revenue: number | null;
  contractYear: number;
  progressNotes: string | null;
  services: Array<{
    serviceCode: string;
    serviceName: string;
    amount: number | null;
  }>;
}

interface PreviewResult {
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: ValidationError[];
  preview: PreviewContract[];
}

type UploadMode = 'replace' | 'merge';
type UploadStep = 'upload' | 'preview' | 'confirm' | 'success';

export default function AdminContractsPage() {
  const [step, setStep] = useState<UploadStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>('merge');
  const [uploadResult, setUploadResult] = useState<{ message: string; totalRows: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 템플릿 다운로드
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/contracts/template');
      if (!response.ok) {
        throw new Error('템플릿 다운로드 실패');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `계약정보_업로드_템플릿_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError('템플릿 다운로드에 실패했습니다.');
    }
  };

  // 파일 선택
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setPreviewResult(null);
    }
  };

  // 파일 미리보기 (검증)
  const handlePreview = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'preview');

      const response = await fetch('/api/admin/contracts/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || '파일 검증에 실패했습니다.');
        return;
      }

      setPreviewResult(result.data);
      setStep('preview');
    } catch {
      setError('파일 검증 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 업로드 확정
  const handleConfirm = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'confirm');
      formData.append('mode', uploadMode);

      const response = await fetch('/api/admin/contracts/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || '업로드에 실패했습니다.');
        return;
      }

      setUploadResult(result.data);
      setStep('success');
    } catch {
      setError('업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초기화
  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setPreviewResult(null);
    setUploadResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 카테고리 라벨
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      DOMESTIC: '국내',
      FOREIGN: '외자계',
      MIGRATED: '이관사',
    };
    return labels[category] || category;
  };

  // 고객분류 라벨
  const getCustomerTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SECURITIES: '증권사',
      INSTITUTION: '유관기관',
      ASSET_MGMT: '자산운용',
      FUTURES: '선물',
      MEDIA: '언론',
    };
    return labels[type] || type;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">계약 정보 관리</h1>
        <p className="text-gray-600">엑셀 파일로 계약 정보를 일괄 업로드합니다.</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Step 1: 파일 업로드 */}
      {step === 'upload' && (
        <div className="space-y-6">
          {/* 템플릿 다운로드 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">1. 템플릿 다운로드</h2>
            <p className="text-gray-600 mb-4">
              먼저 엑셀 템플릿을 다운로드하여 데이터를 입력하세요.
              템플릿에는 작성 안내와 코드 정보가 포함되어 있습니다.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="h-5 w-5" />
              템플릿 다운로드
            </button>
          </div>

          {/* 파일 업로드 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">2. 파일 업로드</h2>
            <p className="text-gray-600 mb-4">
              작성한 엑셀 파일을 업로드하세요. (.xlsx, .xls 형식)
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-4" />
                {file ? (
                  <div>
                    <p className="text-lg font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      클릭하여 파일 선택
                    </p>
                    <p className="text-sm text-gray-500">
                      또는 파일을 여기에 드래그
                    </p>
                  </div>
                )}
              </label>
            </div>

            {file && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handlePreview}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      검증 중...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      파일 검증
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: 미리보기 */}
      {step === 'preview' && previewResult && (
        <div className="space-y-6">
          {/* 검증 결과 요약 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">검증 결과</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">전체 행</p>
                <p className="text-2xl font-bold text-gray-900">{previewResult.totalRows}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">유효한 행</p>
                <p className="text-2xl font-bold text-green-700">{previewResult.validRows}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">오류 행</p>
                <p className="text-2xl font-bold text-red-700">{previewResult.errorRows}</p>
              </div>
            </div>
          </div>

          {/* 오류 목록 */}
          {previewResult.errors.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
              <h2 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                검증 오류 ({previewResult.errors.length}건)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-600">행</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">필드</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">오류 메시지</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">입력값</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewResult.errors.slice(0, 20).map((err, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2 px-3">{err.row}</td>
                        <td className="py-2 px-3">{err.field}</td>
                        <td className="py-2 px-3 text-red-600">{err.message}</td>
                        <td className="py-2 px-3 text-gray-500">{err.value ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewResult.errors.length > 20 && (
                  <p className="mt-2 text-sm text-gray-500">
                    외 {previewResult.errors.length - 20}건의 오류가 더 있습니다.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 미리보기 테이블 */}
          {previewResult.preview.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                데이터 미리보기 (처음 10건)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-600">순번</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">증권사</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">구분</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">고객분류</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">당기매출</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">PB매출</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">2025예상</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">서비스</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewResult.preview.map((contract, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2 px-3">{contract.orderNumber}</td>
                        <td className="py-2 px-3">{contract.companyName}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100">
                            {getCategoryLabel(contract.category)}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                            {getCustomerTypeLabel(contract.customerType)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          {contract.currentRevenue?.toFixed(1) ?? '-'}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {contract.powerbaseRevenue?.toFixed(1) ?? '-'}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {contract.year2025Revenue?.toFixed(1) ?? '-'}
                        </td>
                        <td className="py-2 px-3">
                          {contract.services.length > 0
                            ? contract.services.map(s => s.serviceCode).join(', ')
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 업로드 모드 선택 및 확정 */}
          {previewResult.validRows > 0 && previewResult.errorRows === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">업로드 옵션</h2>

              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="mode"
                    value="merge"
                    checked={uploadMode === 'merge'}
                    onChange={() => setUploadMode('merge')}
                    className="h-4 w-4 text-blue-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">병합 (Merge)</p>
                    <p className="text-sm text-gray-500">
                      같은 증권사/연도의 기존 데이터가 있으면 업데이트, 없으면 추가
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="mode"
                    value="replace"
                    checked={uploadMode === 'replace'}
                    onChange={() => setUploadMode('replace')}
                    className="h-4 w-4 text-blue-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">전체 교체 (Replace)</p>
                    <p className="text-sm text-red-500">
                      ⚠️ 기존 모든 계약 데이터를 삭제하고 새로 업로드
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      업로드 확정 ({previewResult.validRows}건)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 오류가 있을 때 */}
          {previewResult.errorRows > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 mb-4">
                오류가 있는 행이 있습니다. 엑셀 파일을 수정한 후 다시 업로드해주세요.
              </p>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                다시 업로드
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: 성공 */}
      {step === 'success' && uploadResult && (
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">업로드 완료</h2>
          <p className="text-gray-600 mb-6">
            {uploadResult.totalRows}건의 계약 정보가 성공적으로 업로드되었습니다.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              새로 업로드
            </button>
            <a
              href="/dashboard/contracts"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              계약 현황 보기
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
