'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentNav } from '@/components/StudentNav';
import { 
  Cpu, 
  PlusCircle, 
  RotateCw, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  Terminal, 
  HardDrive,
  Loader2,
  X
} from 'lucide-react';

interface Device {
  id: string;
  name: string;
  device_identifier: string;
  status: 'paired' | 'offline' | 'online' | 'syncing';
  last_heartbeat_at?: string;
  last_sync_at?: string;
  queued_recordings: number;
  upload_progress_pct: number;
  ip_address?: string;
  firmware_version?: string;
  created_at: string;
}

export default function DevicesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // Pairing token modal
  const [showPairModal, setShowPairModal] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingExpiresAt, setPairingExpiresAt] = useState<string | null>(null);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Rename modal
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [renaming, setRenaming] = useState(false);

  // Unlink modal
  const [unlinkId, setUnlinkId] = useState<string | null>(null);

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
        setPairingExpiresAt(data.expires_at);
        setShowPairModal(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingToken(false);
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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <StudentNav user={currentUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
              Hardware Device Management
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Raspberry Pi 4 Model B classroom recording units, auto-sync queues, and diagnostics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDevices}
              className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 transition"
              title="Refresh device statuses"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleGeneratePairingCode}
              disabled={generatingToken}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              Pair New Device
            </button>
          </div>
        </div>

        {/* Device List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
            <p className="text-xs">Checking device telemetry...</p>
          </div>
        ) : devices.length === 0 ? (
          /* Empty state */
          <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">No Hardware Devices Paired</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Connect your physical Raspberry Pi 4 recording pod so classroom audio uploads automatically.
              </p>
            </div>
            <button
              onClick={handleGeneratePairingCode}
              disabled={generatingToken}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              Generate Pairing Code
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {devices.map((device) => {
              const isOnline = device.status === 'online';
              return (
                <div
                  key={device.id}
                  className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-2xs space-y-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-amber-400">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          {device.name}
                          <button
                            onClick={() => {
                              setEditingDevice(device);
                              setNewDeviceName(device.name);
                            }}
                            className="text-zinc-400 hover:text-zinc-600"
                            title="Rename device"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </h3>
                        <p className="text-[11px] font-mono text-zinc-500">
                          Identifier: {device.device_identifier}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        isOnline
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                      }`}
                    >
                      {isOnline ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3 h-3 text-zinc-400" />
                          {device.status.toUpperCase()}
                        </>
                      )}
                    </span>
                  </div>

                  {/* Telemetry Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-100 text-xs">
                    <div className="p-2.5 bg-zinc-50 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Queue</span>
                      <span className="text-zinc-900 font-bold mt-0.5 block">
                        {device.queued_recordings || 0} pending
                      </span>
                    </div>

                    <div className="p-2.5 bg-zinc-50 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Last Sync</span>
                      <span className="text-zinc-900 font-bold mt-0.5 block truncate">
                        {device.last_sync_at ? formatDate(device.last_sync_at).split(',')[0] : 'None'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-zinc-50 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Local IP</span>
                      <span className="text-zinc-900 font-bold mt-0.5 block font-mono truncate">
                        {device.ip_address || '127.0.0.1'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-zinc-50 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Firmware</span>
                      <span className="text-zinc-900 font-bold mt-0.5 block font-mono truncate">
                        {device.firmware_version || 'v1.2.0'}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Diagnostics */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <span className="text-zinc-400 text-[11px]">
                      Heartbeat: {formatDate(device.last_heartbeat_at)}
                    </span>

                    <button
                      onClick={() => setUnlinkId(device.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-md transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Unlink Device
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pairing Instructions & Architecture Documentation */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-zinc-900">
              Raspberry Pi 4 Device Agent & Sync Protocol
            </h2>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed">
            The Lecture Pod hardware uses an offline-first Python daemon (`rpi-agent/lecturepod_agent.py`) located directly inside the repository. It captures classroom microphone input, writes to a local SQLite persistent queue, and uploads automatically over Wi-Fi using idempotent verification.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
              <span className="font-bold text-zinc-900">1. Pair Hardware</span>
              <p className="text-zinc-500">
                Generate a 6-character code from this page and pass it to the agent via CLI or onboard button.
              </p>
            </div>
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
              <span className="font-bold text-zinc-900">2. Record Offline</span>
              <p className="text-zinc-500">
                Press the physical capture button or execute `record`. Recordings queue locally with zero loss.
              </p>
            </div>
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
              <span className="font-bold text-zinc-900">3. Auto Sync & ACK</span>
              <p className="text-zinc-500">
                When Wi-Fi connects, the agent registers the recording, streams audio, and waits for server ACK.
              </p>
            </div>
          </div>
        </div>

        {/* ================= PAIRING CODE MODAL ================= */}
        {showPairModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Pair Raspberry Pi 4</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Run this command on your Raspberry Pi terminal or VNC desktop:
                </p>
              </div>

              {/* Code Banner */}
              <div className="p-4 bg-zinc-900 text-white rounded-xl space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  Pairing Code (Valid for 15 minutes)
                </span>
                <div className="text-3xl font-extrabold tracking-wider text-amber-400 font-mono">
                  {pairingCode}
                </div>
              </div>

              {/* Shell command snippet */}
              <div className="p-3 bg-zinc-100 rounded-xl font-mono text-[11px] text-zinc-800 text-left flex items-center justify-between gap-2">
                <span className="truncate">
                  python3 lecturepod_agent.py pair --code {pairingCode}
                </span>
                <button
                  onClick={copyPairingCommand}
                  className="p-1.5 rounded-md hover:bg-zinc-200 text-zinc-600 shrink-0"
                  title="Copy command"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center">
                <button
                  onClick={() => {
                    setShowPairModal(false);
                    fetchDevices();
                  }}
                  className="w-full px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition"
                >
                  Done (I have paired on the Pi)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= RENAME MODAL ================= */}
        {editingDevice && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <h3 className="text-sm font-bold text-zinc-900">Rename Device</h3>
                <button onClick={() => setEditingDevice(null)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRename} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Device Label</label>
                  <input
                    type="text"
                    required
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingDevice(null)}
                    className="px-3 py-1.5 text-xs text-zinc-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={renaming}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-zinc-900 rounded-lg"
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
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 text-center">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900">Unlink Raspberry Pi?</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  The device will be disconnected from your account. Existing recorded lectures will remain safely in your library.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setUnlinkId(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUnlink(unlinkId)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition"
                >
                  Confirm Unlink
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
