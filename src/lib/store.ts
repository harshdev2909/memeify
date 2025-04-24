import { create } from 'zustand';

type ModalState = {
  isAuthModalOpen: boolean;
  isCommentsModalOpen: boolean;
  activeMemeId: string | null;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openCommentsModal: (memeId: string) => void;
  closeCommentsModal: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
  isAuthModalOpen: false,
  isCommentsModalOpen: false,
  activeMemeId: null,
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  openCommentsModal: (memeId) => set({ isCommentsModalOpen: true, activeMemeId: memeId }),
  closeCommentsModal: () => set({ isCommentsModalOpen: false, activeMemeId: null }),
}));

type NotificationState = {
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (message, type) => 
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: Date.now().toString(), message, type },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));