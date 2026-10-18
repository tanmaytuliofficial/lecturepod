import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  UploadCloud, 
  Cpu, 
  Sparkles, 
  AlertCircle, 
  HardDrive 
} from 'lucide-react';

export type LectureStatus = 
  | 'saved_on_device'
  | 'waiting_to_sync'
  | 'uploading'
  | 'uploaded'
  | 'transcribing'
  | 'generating_study_material'
  | 'ready'
  | 'failed';

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: Props) {
  const configs: Record<string, { label: string; color: string; icon: any }> = {
    saved_on_device: {
      label: 'Saved on Device',
      color: 'bg-zinc-100 text-zinc-700 border-zinc-200',
      icon: HardDrive,
    },
    waiting_to_sync: {
      label: 'Waiting to Sync',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
    },
    uploading: {
      label: 'Uploading',
      color: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
      icon: UploadCloud,
    },
    uploaded: {
      label: 'Uploaded',
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: CheckCircle2,
    },
    transcribing: {
      label: 'Transcribing',
      color: 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse',
      icon: Cpu,
    },
    generating_study_material: {
      label: 'Generating Study Kit',
      color: 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse',
      icon: Sparkles,
    },
    ready: {
      label: 'Ready',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    },
    failed: {
      label: 'Failed — Retry Available',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertCircle,
    },
  };

  const config = configs[status] || {
    label: status.replace(/_/g, ' '),
    color: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    icon: Clock,
  };

  const Icon = config.icon;
  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${padding} ${config.color}`}
    >
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      {config.label}
    </span>
  );
}
