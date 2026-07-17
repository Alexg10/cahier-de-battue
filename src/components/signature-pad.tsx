"use client";

import { Eraser, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Pavé de signature manuscrite (canvas tactile). Appelle `onSave` avec un
 * data-URL PNG, ou `onCancel`. Fonctionne hors-ligne (rien de réseau).
 */
export function SignaturePad({
  onSave,
  onCancel,
  saving,
  saveLabel = "Valider la signature",
  notice,
}: {
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
  saving?: boolean;
  saveLabel?: string;
  /** Encart d'avertissement affiché sous le canvas (ex. consignes de sécurité). */
  notice?: React.ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#1c1917";
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!hasDrawn) setHasDrawn(true);
  }

  function end() {
    drawing.current = false;
    last.current = null;
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  }

  function save() {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    onSave(canvas.toDataURL("image/png"));
  }

  return (
    <div className="flex flex-col gap-3">
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="signature-canvas h-44 w-full rounded-[var(--radius)] border-2 border-dashed border-input bg-white"
      />
      {notice ? (
        <div className="flex items-start gap-2 rounded-[var(--radius)] border border-warning/40 bg-amber-50 p-3 text-sm font-semibold text-warning">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={clear}
          className="shrink-0"
        >
          <Eraser />
          Effacer
        </Button>
        <Button
          type="button"
          block
          onClick={save}
          disabled={!hasDrawn || saving}
          className="min-w-0"
        >
          <span className="truncate">
            {saving ? "Enregistrement…" : saveLabel}
          </span>
        </Button>
      </div>
      {onCancel ? (
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      ) : null}
    </div>
  );
}
