import { Button } from './Button.jsx';
import { Modal } from './Modal.jsx';

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Emin misin?',
  description,
  confirmLabel = 'Sil',
  cancelLabel = 'Vazgeç',
  danger = true,
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            data-autofocus
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {description ? <p className="text-sm text-ink-dim leading-relaxed">{description}</p> : null}
      {children}
    </Modal>
  );
}
