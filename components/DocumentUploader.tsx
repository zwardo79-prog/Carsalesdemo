'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // Adjust path to your Supabase client
import { Button } from '@/components/ui/button';
import { Upload, FileCheck, Loader2 } from 'lucide-react';

type Props = {
  customerId: string;
  docType: 'logbook' | 'id_document' | 'agreement';
  label: string;
  currentUrl?: string | null;
  onUploadComplete: (url: string) => void;
};

export function DocumentUploader({ customerId, docType, label, currentUrl, onUploadComplete }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const filePath = `${customerId}/${docType}_${Date.now()}.${fileExt}`;

    // 1. Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('customer-docs')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('customer-docs')
      .getPublicUrl(filePath);

    // 3. Update Customer Record in Database
    const columnName = `${docType}_url`;
    const { error: dbError } = await supabase
      .from('customers')
      .update({ [columnName]: publicUrl })
      .eq('id', customerId);

    setUploading(false);

    if (dbError) {
      alert(`Database update failed: ${dbError.message}`);
    } else {
      onUploadComplete(publicUrl);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {currentUrl ? 'Document uploaded' : 'No document attached'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {currentUrl && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 underline"
          >
            <FileCheck className="h-4 w-4 inline mr-1" /> View
          </a>
        )}
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <Button variant="outline" size="sm" asChild disabled={uploading}>
            <span>
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-1" />
              )}
              {currentUrl ? 'Replace' : 'Upload'}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
}
