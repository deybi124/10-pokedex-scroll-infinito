import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  cert: vi.fn((credenciales: unknown) => ({ credenciales })),
  getApps: vi.fn(),
  initializeApp: vi.fn(),
}));

vi.mock("node:fs", () => ({
  existsSync: mocks.existsSync,
  readFileSync: mocks.readFileSync,
}));
vi.mock("firebase-admin/app", () => ({
  cert: mocks.cert,
  getApps: mocks.getApps,
  initializeApp: mocks.initializeApp,
}));
vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(),
}));

import { appAdmin } from "@/lib/firebaseAdmin";

describe("appAdmin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getApps.mockReturnValue([]);
    mocks.existsSync.mockReturnValue(true);
    mocks.initializeApp.mockReturnValue({ name: "test-app" });
  });

  it("lee la cuenta de servicio local y normaliza los saltos de línea", () => {
    mocks.readFileSync.mockReturnValue(
      JSON.stringify({
        type: "service_account",
        project_id: "pokedex-test",
        client_email: "firebase-admin@example.iam.gserviceaccount.com",
        private_key:
          "-----BEGIN PRIVATE KEY-----\nlinea-prueba\n-----END PRIVATE KEY-----\n",
        private_key_id: "id-prueba",
      }),
    );

    const app = appAdmin();

    expect(app).toEqual({ name: "test-app" });
    expect(mocks.cert).toHaveBeenCalledWith({
      projectId: "pokedex-test",
      clientEmail: "firebase-admin@example.iam.gserviceaccount.com",
      privateKey:
        "-----BEGIN PRIVATE KEY-----\nlinea-prueba\n-----END PRIVATE KEY-----\n",
    });
    expect(mocks.readFileSync).toHaveBeenCalledWith(
      expect.stringMatching(/serviceAccountKey\.json$/),
      "utf8",
    );
  });

  it("normaliza los saltos de línea de FIREBASE_PRIVATE_KEY", () => {
    mocks.existsSync.mockReturnValue(false);
    vi.stubEnv("FIREBASE_PROJECT_ID", "pokedex-test");
    vi.stubEnv(
      "FIREBASE_CLIENT_EMAIL",
      "firebase-admin@example.iam.gserviceaccount.com",
    );
    vi.stubEnv(
      "FIREBASE_PRIVATE_KEY",
      "-----BEGIN PRIVATE KEY-----\\nlinea-prueba\\n-----END PRIVATE KEY-----\\n",
    );

    appAdmin();

    expect(mocks.cert).toHaveBeenCalledWith({
      projectId: "pokedex-test",
      clientEmail: "firebase-admin@example.iam.gserviceaccount.com",
      privateKey:
        "-----BEGIN PRIVATE KEY-----\nlinea-prueba\n-----END PRIVATE KEY-----\n",
    });
  });
});
