/** @vitest-environment jsdom */

import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

type ObservadorFalso = {
  callback: IntersectionObserverCallback;
  disconnect: ReturnType<typeof vi.fn>;
};

let observadorActual: ObservadorFalso | undefined;

class IntersectionObserverMock {
  readonly callback: IntersectionObserverCallback;
  disconnect = vi.fn();
  observe = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = "";
  thresholds = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    observadorActual = {
      callback,
      disconnect: this.disconnect,
    };
  }
}

function Harness({ alIntersectar }: { alIntersectar: () => void }) {
  const [habilitado, setHabilitado] = useState(true);
  const { centinelaRef } = useInfiniteScroll({
    habilitado,
    alIntersectar,
  });

  return (
    <div>
      <div ref={centinelaRef} data-testid="centinela" />
      <button type="button" onClick={() => setHabilitado(false)}>
        desactivar
      </button>
    </div>
  );
}

describe("useInfiniteScroll", () => {
  afterEach(() => {
    cleanup();
    observadorActual = undefined;
    vi.unstubAllGlobals();
  });

  it("pide la página siguiente al intersectar el centinela", async () => {
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

    const alIntersectar = vi.fn();
    render(<Harness alIntersectar={alIntersectar} />);

    await waitFor(() => expect(observadorActual).toBeDefined());

    act(() => {
      observadorActual?.callback(
        [
          {
            isIntersecting: true,
            intersectionRatio: 1,
          } as IntersectionObserverEntry,
        ],
        observadorActual as unknown as IntersectionObserver,
      );
    });

    expect(alIntersectar).toHaveBeenCalledTimes(1);
  });

  it("no observa si IntersectionObserver no existe", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const alIntersectar = vi.fn();
    render(<Harness alIntersectar={alIntersectar} />);
    expect(screen.getByTestId("centinela")).toBeTruthy();
    expect(observadorActual).toBeUndefined();
  });
});
