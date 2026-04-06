import { create } from 'zustand'
import { settingsApi } from '../api/settings'
import { modelsApi } from '../api/models'
import type { PermissionMode, EffortLevel, ModelInfo } from '../types/settings'

type SettingsStore = {
  permissionMode: PermissionMode
  currentModel: ModelInfo | null
  effortLevel: EffortLevel
  availableModels: ModelInfo[]
  isLoading: boolean

  fetchAll: () => Promise<void>
  setPermissionMode: (mode: PermissionMode) => Promise<void>
  setModel: (modelId: string) => Promise<void>
  setEffort: (level: EffortLevel) => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  permissionMode: 'default',
  currentModel: null,
  effortLevel: 'high',
  availableModels: [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true })
    try {
      const [{ mode }, { models }, { model }, { level }] = await Promise.all([
        settingsApi.getPermissionMode(),
        modelsApi.list(),
        modelsApi.getCurrent(),
        modelsApi.getEffort(),
      ])
      set({ permissionMode: mode, availableModels: models, currentModel: model, effortLevel: level, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  setPermissionMode: async (mode) => {
    set({ permissionMode: mode })
    await settingsApi.setPermissionMode(mode)
  },

  setModel: async (modelId) => {
    await modelsApi.setCurrent(modelId)
    const { model } = await modelsApi.getCurrent()
    set({ currentModel: model })
  },

  setEffort: async (level) => {
    set({ effortLevel: level })
    await modelsApi.setEffort(level)
  },
}))
