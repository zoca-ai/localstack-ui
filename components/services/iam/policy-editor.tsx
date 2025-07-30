'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, Copy, FileJson } from 'lucide-react';
import { toast } from 'sonner';

interface PolicyEditorProps {
  initialValue?: string;
  onSave: (policy: string) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  className?: string;
}

export function PolicyEditor({ 
  initialValue = '', 
  onSave, 
  onCancel,
  readOnly = false,
  className = ''
}: PolicyEditorProps) {
  const [policyDocument, setPolicyDocument] = useState(initialValue);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setPolicyDocument(initialValue);
  }, [initialValue]);

  const validateJson = (value: string) => {
    try {
      if (value.trim()) {
        JSON.parse(value);
        setIsValid(true);
        setError('');
      }
    } catch (e) {
      setIsValid(false);
      setError('Invalid JSON format');
    }
  };

  const handleChange = (value: string) => {
    setPolicyDocument(value);
    validateJson(value);
  };

  const formatJson = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(policyDocument), null, 2);
      setPolicyDocument(formatted);
      setIsValid(true);
      setError('');
    } catch (e) {
      setError('Cannot format invalid JSON');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(policyDocument);
    toast.success('Policy copied to clipboard');
  };

  const handleSave = () => {
    if (!isValid) {
      setError('Please fix JSON errors before saving');
      return;
    }
    onSave(policyDocument);
  };

  const getDefaultPolicy = () => {
    const defaultPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['s3:GetObject'],
          Resource: ['arn:aws:s3:::example-bucket/*']
        }
      ]
    };
    setPolicyDocument(JSON.stringify(defaultPolicy, null, 2));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileJson className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Policy Document</span>
          {!readOnly && (
            <Badge variant={isValid ? 'default' : 'destructive'} className="text-xs">
              {isValid ? 'Valid JSON' : 'Invalid JSON'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && !policyDocument && (
            <Button
              variant="ghost"
              size="sm"
              onClick={getDefaultPolicy}
            >
              Use Template
            </Button>
          )}
          {policyDocument && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={formatJson}
                disabled={!isValid}
              >
                Format
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={policyDocument}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*"
    }
  ]
}`}
          className={`font-mono text-xs min-h-[300px] ${
            !isValid && !readOnly ? 'border-red-500 focus:ring-red-500' : ''
          }`}
          readOnly={readOnly}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!readOnly && (
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={!isValid || !policyDocument}>
            <Check className="h-4 w-4 mr-2" />
            Save Policy
          </Button>
        </div>
      )}
    </div>
  );
}