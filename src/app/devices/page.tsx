'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StudentLayout } from '@/components/StudentLayout';
import { 
  Radio, 
  PlusCircle, 
  RefreshCw, 
  Trash2, 
  Edit2, 
  Copy, 
  Check, 
  Terminal, 
  Activity, 
  Wifi, 
  WifiOff, 
  Clock, 
  HardDrive, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  RotateCw,
  Loader2,
  Zap,
  Sparkles
} from 'lucide-react';

interface Device {
  id: string;
  name: string;
  device_identifier: string;
  status: 'paired' | 'offline' | 'online' | 'syncing';
  last_heartbeat_at?: string;
  last_sync_at?: string;
  queued_recordings?: number;
  upload_progress_pct?: number;
  ip_address?: string;
  firmware_version?: string;
  created_at: string;
}

export default function DevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Pairing code modal state
  const [showPairModal, setShowPairModal] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Rename modal
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [renaming, setRenaming] = useState(false);

  // Unlink modal
  const [unlinkId, setUnlinkId] = useState<string | null>(null);

  // Demo state
  const [simulatingPair, setSimulatingPair] = useState(false);
  const [simulatingSync, setSimulatingSync] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setDevices(data.devices || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => {});

    fetchDevices();
  }, [router]);

  const handleGeneratePairingCode = async () => {
    setGeneratingToken(true);
    try {
      const res = await fetch('/api/devices/generate-token', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setPairingCode(data.pairing_code);
        setShowPairModal(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleSimulatePair = async () => {
    setSimulatingPair(true);
    try {
      const res = await fetch('/api/demo/pair-device', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setDemoNotice('Virtual LecturePod Device connected online with active telemetry!');
        fetchDevices();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulatingPair(false);
    }
  };

  const handleSimulateSync = async () => {
    setSimulatingSync(true);
    try {
      const res = await fetch('/api/demo/simulate-sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setDemoNotice('Simulated recording uploaded and processed into your library!');
        fetchDevices();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulatingSync(false);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice || !newDeviceName.trim()) return;
    setRenaming(true);
    try {
      const res = await fetch(`/api/devices/${editingDevice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDeviceName.trim() }),
      });
      if (res.ok) {
        setEditingDevice(null);
        fetchDevices();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRenaming(false);
    }
  };

  const handleUnlink = async (id: string) => {
    try {
      const res = await fetch(`/api/devices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUnlinkId(null);
        fetchDevices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyPairingCommand = () => {
    if (!pairingCode) return;
    const cmd = `python3 lecturepod_agent.py pair --code ${pairingCode} --server http://localhost:3000`;
    navigator.clipboard.writeText(cmd);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <StudentLayout user={currentUser} breadcrumbs={[{ label: 'LecturePod Device' }]}>
      <div className="space-y-8">
        {/* Notice */}
        {demoNotice && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{demoNotice}</span>
            </div>
            <button onClick={() => setDemoNotice(null)} className="text-amber-700 dark:text-amber-400 font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400">
                Acoustic Hardware Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight mt-1">
              LecturePod Device Management
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Pair and monitor your physical classroom capture units, offline queues, and auto-sync telemetry
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSimulatePair}
              disabled={simulatingPair}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition shadow-xs disabled:opacity-50"
              title="Pair a simulated LecturePod Device in 1 click"
            >
              <Zap className="w-3.5 h-3.5 text-zinc-950" />
              {simulatingPair ? 'Connecting...' : 'One-Click Demo Pair'}
            </button>

            <button
              onClick={fetchDevices}
              className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition shadow-xs"
              title="Refresh telemetry"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleGeneratePairingCode}
              disabled={generatingToken}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
              Generate Pairing Code
            </button>
          </div>
        </div>

        {/* Demo Hardware Playground Banner */}
        <div className="p-6 rounded-3xl bg-zinc-900 text-white border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                Hardware in Production? Use Demo Simulator
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Full Edge Protocol Interactive Sandbox</h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Experience the entire hardware handshake without waiting for physical assembly. Connect a virtual device, trigger offline captures, and verify cryptographic ACK telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleSimulateSync}
              disabled={simulatingSync}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
            >
              {simulatingSync ? 'Syncing Audio...' : 'Simulate Audio Upload'}
            </button>

            <button
              onClick={handleSimulatePair}
              disabled={simulatingPair}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold border border-zinc-700 transition disabled:opacity-50"
            >
              Simulate Device Ping
            </button>
          </div>
        </div>

        {/* Device List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
            <p className="text-xs">Checking hardware telemetry...</p>
          </div>
        ) : devices.length === 0 ? (
          /* Empty state */
          <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-5 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto ring-1 ring-amber-200/60 dark:ring-amber-800/60 shadow-xs">
              <Radio className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">No LecturePod Device Paired</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Connect your physical LecturePod Device, or click below to simulate an active unit instantly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSimulatePair}
                disabled={simulatingPair}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition"
              >
                <Zap className="w-3.5 h-3.5 text-zinc-950" />
                {simulatingPair ? 'Pairing...' : 'One-Click Demo Pair'}
              </button>

              <button
                onClick={handleGeneratePairingCode}
                disabled={generatingToken}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white dark:text-zinc-950 bg-zinc-950 dark:bg-zinc-100 rounded-xl shadow-xs transition"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                Generate Pairing Code
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {devices.map((device) => {
              const isOnline = device.status === 'online';
              return (
                <div
                  key={device.id}
                  className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-7 shadow-xs space-y-6 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-zinc-950 dark:bg-zinc-800 flex items-center justify-center text-amber-400 ring-1 ring-zinc-800 shadow-sm">
                        <Radio className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                          {device.name}
                          <button
                            onClick={() => {
                              setEditingDevice(device);
                              setNewDeviceName(device.name);
                            }}
                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            title="Rename device"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </h3>
                        <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                          ID: {device.device_identifier}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                        isOnline
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                      }`}
                    >
                      {isOnline ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Active Online
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3.5 h-3.5 text-zinc-400" />
                          {device.status.toUpperCase()}
                        </>
                      )}
                    </span>
                  </div>

                  {/* Telemetry Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Queue</span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold mt-1 block">
                        {device.queued_recordings || 0} pending
                      </span>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Last Sync</span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold mt-1 block truncate">
                        {device.last_sync_at ? formatDate(device.last_sync_at).split(',')[0] : 'None'}
                      </span>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Local IP</span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold mt-1 block font-mono truncate">
                        {device.ip_address || '127.0.0.1'}
                      </span>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Firmware</span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold mt-1 block font-mono truncate">
                        {device.firmware_version || 'v1.2.0'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <button
                      onClick={handleSimulateSync}
                      disabled={simulatingSync}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      <Zap className="w-3.5 h-3.5" /> Trigger Simulated Sync
                    </button>

                    <button
                      onClick={() => setUnlinkId(device.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 rounded-xl transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Unlink Unit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pairing Instructions & Architecture Documentation */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-7 sm:p-9 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                LecturePod Device Agent & Auto-Sync Protocol
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Autonomous edge recording and sync engine</p>
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            The LecturePod Device runs a lightweight, resilient edge recording daemon. It buffers recordings locally on SQLite, verifies Wi-Fi connectivity, and syncs idempotently with server checksum confirmation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-1.5">
              <span className="font-bold text-zinc-950 dark:text-white">1. Secure 6-Char Handshake</span>
              <p className="text-zinc-500 dark:text-zinc-400">
                Generate a pairing code on the dashboard and pass it to the agent CLI to issue a signed API token.
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-1.5">
              <span className="font-bold text-zinc-950 dark:text-white">2. Offline First Buffering</span>
              <p className="text-zinc-500 dark:text-zinc-400">
                Press the physical capture button or execute `record`. Recordings queue locally with zero loss.
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-1.5">
              <span className="font-bold text-zinc-950 dark:text-white">3. Auto Sync & ACK</span>
              <p className="text-zinc-500 dark:text-zinc-400">
                When network becomes available, the unit registers, streams audio, and verifies server ACK.
              </p>
            </div>
          </div>
        </div>

        {/* ================= PAIRING CODE MODAL ================= */}
        {showPairModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-7 shadow-2xl space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto ring-1 ring-amber-200/80 shadow-xs">
                <Radio className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Pair LecturePod Device</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Run this pairing command on your LecturePod Device terminal or device shell:
                </p>
              </div>

              {/* Code Banner */}
              <div className="p-5 bg-zinc-950 text-white rounded-2xl space-y-2 ring-1 ring-zinc-800">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  Pairing Code (Valid for 15 minutes)
                </span>
                <div className="text-3xl font-extrabold tracking-widest text-amber-400 font-mono">
                  {pairingCode}
                </div>
              </div>

              {/* Shell command snippet */}
              <div className="p-3.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl font-mono text-[11px] text-zinc-800 dark:text-zinc-200 text-left flex items-center justify-between gap-2 border border-zinc-200 dark:border-zinc-800">
                <span className="truncate">
                  python3 lecturepod_agent.py pair --code {pairingCode}
                </span>
                <button
                  onClick={copyPairingCommand}
                  className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0"
                  title="Copy command"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleSimulatePair}
                  className="w-full px-5 py-2.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition"
                >
                  Or Pair Instantly with Built-In Simulator
                </button>

                <button
                  onClick={() => {
                    setShowPairModal(false);
                    fetchDevices();
                  }}
                  className="w-full px-5 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= RENAME MODAL ================= */}
        {editingDevice && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
              <h4 className="text-sm font-bold text-zinc-950 dark:text-white">Rename LecturePod Device</h4>
              <form onSubmit={handleRename} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Device Friendly Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingDevice(null)}
                    className="px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={renaming}
                    className="px-4 py-2 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl"
                  >
                    {renaming ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= UNLINK MODAL ================= */}
        {unlinkId && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-950 dark:text-white">Unlink LecturePod Device?</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  The device will be disconnected from your account. Existing recorded lectures will remain safely in your library.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setUnlinkId(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUnlink(unlinkId)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition"
                >
                  Confirm Unlink
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
