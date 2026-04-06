import { useState, useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { useUIStore } from '../stores/uiStore'
import { settingsApi } from '../api/settings'
import type { PermissionMode, EffortLevel, ModelInfo } from '../types/settings'

type SettingsTab = 'model' | 'permissions' | 'general'

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('model')
  const setActiveView = useUIStore((s) => s.setActiveView)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--color-surface)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-border)]">
        <button
          onClick={() => setActiveView('code')}
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-secondary)]"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Settings</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Tab navigation */}
        <div className="w-48 border-r border-[var(--color-border)] py-3 flex-shrink-0">
          <TabButton
            icon="auto_awesome"
            label="Model"
            active={activeTab === 'model'}
            onClick={() => setActiveTab('model')}
          />
          <TabButton
            icon="shield"
            label="Permissions"
            active={activeTab === 'permissions'}
            onClick={() => setActiveTab('permissions')}
          />
          <TabButton
            icon="tune"
            label="General"
            active={activeTab === 'general'}
            onClick={() => setActiveTab('general')}
          />
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {activeTab === 'model' && <ModelSettings />}
          {activeTab === 'permissions' && <PermissionSettings />}
          {activeTab === 'general' && <GeneralSettings />}
        </div>
      </div>
    </div>
  )
}

function TabButton({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors ${
        active
          ? 'bg-[var(--color-surface-selected)] text-[var(--color-text-primary)] font-medium'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </button>
  )
}

// ─── Model Settings ──────────────────────────────────────────

function ModelSettings() {
  const { availableModels, currentModel, effortLevel, setModel, setEffort, fetchAll } = useSettingsStore()
  const [customModelId, setCustomModelId] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSelectModel = async (model: ModelInfo) => {
    await setModel(model.id)
  }

  const handleCustomModel = async () => {
    const id = customModelId.trim()
    if (!id) return
    await setModel(id)
    setShowCustom(false)
    setCustomModelId('')
  }

  const MODEL_ICONS: Record<string, string> = {
    'opus': 'diamond',
    'sonnet': 'auto_awesome',
    'haiku': 'bolt',
  } as const

  const getModelIcon = (id: string) => {
    if (id.includes('opus')) return MODEL_ICONS['opus']
    if (id.includes('sonnet')) return MODEL_ICONS['sonnet']
    if (id.includes('haiku')) return MODEL_ICONS['haiku']
    return 'smart_toy'
  }

  const EFFORT_LABELS: Record<EffortLevel, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    max: 'Max',
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Model</h2>
      <p className="text-sm text-[var(--color-text-tertiary)] mb-4">Choose the AI model for new conversations.</p>

      <div className="flex flex-col gap-2 mb-6">
        {availableModels.map((model) => {
          const isSelected = currentModel?.id === model.id
          return (
            <button
              key={model.id}
              onClick={() => handleSelectModel(model)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'border-[var(--color-brand)] bg-[var(--color-primary-fixed)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-focus)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-[var(--color-text-secondary)]">
                {getModelIcon(model.id)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">{model.name}</div>
                <div className="text-xs text-[var(--color-text-tertiary)]">{model.description} · {model.context} context</div>
              </div>
              {isSelected && (
                <span className="material-symbols-outlined text-[18px] text-[var(--color-brand)]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              )}
            </button>
          )
        })}

        {/* Custom model */}
        {showCustom ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--color-border)]">
            <input
              type="text"
              value={customModelId}
              onChange={(e) => setCustomModelId(e.target.value)}
              placeholder="Enter model ID (e.g. claude-sonnet-4-6-20250514)"
              className="flex-1 text-sm bg-transparent outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
              onKeyDown={(e) => e.key === 'Enter' && handleCustomModel()}
            />
            <button onClick={handleCustomModel} className="px-3 py-1 text-xs font-semibold text-white bg-[var(--color-brand)] rounded-lg hover:opacity-90">
              Apply
            </button>
            <button onClick={() => setShowCustom(false)} className="px-2 py-1 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-[var(--color-border)] hover:border-[var(--color-border-focus)] text-left transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-[var(--color-text-tertiary)]">add</span>
            <span className="text-sm text-[var(--color-text-secondary)]">Use custom model ID</span>
          </button>
        )}
      </div>

      {/* Effort level */}
      <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Effort Level</h2>
      <p className="text-sm text-[var(--color-text-tertiary)] mb-3">Controls how much computation the model uses.</p>
      <div className="flex gap-2">
        {(['low', 'medium', 'high', 'max'] as EffortLevel[]).map((level) => (
          <button
            key={level}
            onClick={() => setEffort(level)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
              effortLevel === level
                ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)]'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            {EFFORT_LABELS[level]}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Permission Settings ──────────────────────────────────────

function PermissionSettings() {
  const { permissionMode, setPermissionMode } = useSettingsStore()

  const MODES: Array<{ mode: PermissionMode; icon: string; label: string; desc: string }> = [
    { mode: 'default', icon: 'verified_user', label: 'Ask permissions', desc: 'Ask before executing tools' },
    { mode: 'acceptEdits', icon: 'edit_note', label: 'Accept edits', desc: 'Auto-approve file edits, ask for others' },
    { mode: 'plan', icon: 'architecture', label: 'Plan mode', desc: 'Think and plan without executing' },
    { mode: 'bypassPermissions', icon: 'bolt', label: 'Bypass all', desc: 'Skip all permission checks (dangerous)' },
  ]

  return (
    <div className="max-w-xl">
      <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Permission Mode</h2>
      <p className="text-sm text-[var(--color-text-tertiary)] mb-4">Controls how tool execution permissions are handled.</p>

      <div className="flex flex-col gap-2">
        {MODES.map(({ mode, icon, label, desc }) => {
          const isSelected = permissionMode === mode
          return (
            <button
              key={mode}
              onClick={() => setPermissionMode(mode)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'border-[var(--color-brand)] bg-[var(--color-primary-fixed)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-focus)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-[var(--color-text-secondary)]">{icon}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</div>
                <div className="text-xs text-[var(--color-text-tertiary)]">{desc}</div>
              </div>
              {isSelected && (
                <span className="material-symbols-outlined text-[18px] text-[var(--color-brand)]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── General Settings ──────────────────────────────────────────

function GeneralSettings() {
  const [apiBase, setApiBase] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    settingsApi.getUser().then((s) => {
      setApiBase((s as any).apiBaseUrl || '')
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    const updates: Record<string, unknown> = {}
    if (apiBase) updates.apiBaseUrl = apiBase
    await settingsApi.updateUser(updates)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">General</h2>
      <p className="text-sm text-[var(--color-text-tertiary)] mb-4">Advanced configuration settings.</p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">API Base URL</label>
          <input
            type="text"
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
            placeholder="https://api.anthropic.com"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-border-focus)]"
          />
          <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">Override the Anthropic API endpoint. Leave empty for default.</p>
        </div>

        <button
          onClick={handleSave}
          className="self-start px-4 py-2 text-xs font-semibold text-white bg-[var(--color-brand)] rounded-lg hover:opacity-90 transition-opacity"
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
