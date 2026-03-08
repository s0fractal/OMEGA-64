// test_gate_runner_cli.ts
// Smoke test for CLI wrapper over GATE_RUNNER.

import { INVARIANT_PACKET_INVARIANT_PACKET as INVARIANT_PACKET } from "@omega";

Deno.test("gate runner cli processes JSON input and writes output", async () => {
  const tempDir = await Deno.makeTempDir({ prefix: "omega-gate-runner-cli-" });
  const inputPath = `${tempDir}/input.json`;
  const outputPath = `${tempDir}/output.json`;
  const ledgerPath = `${tempDir}/ledger.jsonl`;

  try {
    const invariantPacket = await INVARIANT_PACKET.seal({
      tick_anchor: 1,
      canon_index_chain_checked: true,
      canon_index_chain_ok: true,
      gate_admission_index_chain_checked: true,
      gate_admission_index_chain_ok: true,
      ledger_chain_checked: true,
      ledger_chain_ok: true,
      witness: "cli-test",
    });

    const input = {
      state: {
        tick: 1,
        state_hash: "state_1",
        state_i16: Array.from({ length: 64 }, () => 0),
      },
      proposals: [
        {
          proposal_id: "p_local",
          tick: 1,
          base_state_hash: "state_1",
          agent_id: "agent_sync",
          intent: "cli_smoke",
          confidence: 1,
          delta: [{ level: 2, value: 7 }],
          cost_estimate: 100,
          artifact_hash: "a1",
          semantic_fingerprint: "s1",
          target_path: "LOCAL",
        },
      ],
      config: {
        max_abs_delta_per_level: 1000,
        max_total_abs_delta_per_tick: 5000,
        max_cost_per_agent: 10000,
        reliability_weight: { agent_sync: 1.0 },
        dry_run: false,
      },
      mode: "INVARIANT_CONTEXT",
      invariantPacket,
      witness: "cli-test",
    };
    await Deno.writeTextFile(inputPath, JSON.stringify(input, null, 2));

    const cmd = new Deno.Command("deno", {
      args: [
        "run",
        "-A",
        "4/0/GATE_RUNNER_CLI/_.ts",
        "--input",
        inputPath,
        "--output",
        outputPath,
        "--ledger",
        ledgerPath,
        "--pretty",
      ],
      cwd: "/Users/s0fractal/OMEGA",
    });

    const res = await cmd.output();
    if (!res.success) {
      const stderr = new TextDecoder().decode(res.stderr);
      throw new Error(`CLI failed: ${stderr}`);
    }

    const outputRaw = await Deno.readTextFile(outputPath);
    const output = JSON.parse(outputRaw);
    if (output.bridge_mode !== "GREEN") {
      throw new Error(`expected bridge_mode GREEN, got ${output.bridge_mode}`);
    }
    if (!output.invariant_packet) {
      throw new Error("expected invariant_packet in CLI output");
    }
    if (output.nextState.tick !== 2) {
      throw new Error(`expected next tick 2, got ${output.nextState.tick}`);
    }
    if (output.nextState.state_i16[2] === 0) {
      throw new Error("expected local level mutation in CLI output");
    }

    const ledgerRaw = await Deno.readTextFile(ledgerPath);
    const lines = ledgerRaw.split("\n").filter((x) => x.trim().length > 0);
    if (lines.length !== 2) {
      throw new Error(
        `expected 2 ledger lines (bridge + event), got ${lines.length}`,
      );
    }
    if (!lines[0].includes('"event_type":"BRIDGE_MODE_EVENT"')) {
      throw new Error("first ledger line should be BRIDGE_MODE_EVENT");
    }
    if (lines[1].includes('"event_type"')) {
      throw new Error("second ledger line should be LedgerEvent");
    }
  } finally {
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch { /* ignore */ }
  }
});

Deno.test("gate runner cli derives invariant packet from invariant report", async () => {
  const tempDir = await Deno.makeTempDir({ prefix: "omega-gate-runner-cli-" });
  const inputPath = `${tempDir}/input.json`;
  const outputPath = `${tempDir}/output.json`;
  const ledgerPath = `${tempDir}/ledger.jsonl`;

  try {
    const input = {
      state: {
        tick: 1,
        state_hash: "state_1",
        state_i16: Array.from({ length: 64 }, () => 0),
      },
      proposals: [
        {
          proposal_id: "p_local",
          tick: 1,
          base_state_hash: "state_1",
          agent_id: "agent_sync",
          intent: "cli_smoke",
          confidence: 1,
          delta: [{ level: 2, value: 7 }],
          cost_estimate: 100,
          artifact_hash: "a1",
          semantic_fingerprint: "s1",
          target_path: "LOCAL",
        },
      ],
      config: {
        max_abs_delta_per_level: 1000,
        max_total_abs_delta_per_tick: 5000,
        max_cost_per_agent: 10000,
        reliability_weight: { agent_sync: 1.0 },
        dry_run: false,
      },
      mode: "INVARIANT_CONTEXT",
      invariantReport: {
        index_chain_checked: true,
        index_chain_ok: true,
        index_chain_checked_records: 1,
        index_chain_failures: [],
        gate_admission_index_chain_checked: true,
        gate_admission_index_chain_ok: true,
        gate_admission_index_chain_checked_records: 1,
        gate_admission_index_chain_failures: [],
      },
      witness: "cli-test",
    };
    await Deno.writeTextFile(inputPath, JSON.stringify(input, null, 2));

    const cmd = new Deno.Command("deno", {
      args: [
        "run",
        "-A",
        "4/0/GATE_RUNNER_CLI/_.ts",
        "--input",
        inputPath,
        "--output",
        outputPath,
        "--ledger",
        ledgerPath,
        "--pretty",
      ],
      cwd: "/Users/s0fractal/OMEGA",
    });

    const res = await cmd.output();
    if (!res.success) {
      const stderr = new TextDecoder().decode(res.stderr);
      throw new Error(`CLI failed: ${stderr}`);
    }

    const outputRaw = await Deno.readTextFile(outputPath);
    const output = JSON.parse(outputRaw);
    if (!output.invariant_packet) {
      throw new Error("expected derived invariant_packet in CLI output");
    }
  } finally {
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch { /* ignore */ }
  }
});

Deno.test("gate runner cli emits invariant packet in packet mode", async () => {
  const tempDir = await Deno.makeTempDir({ prefix: "omega-gate-runner-cli-" });
  const inputPath = `${tempDir}/input.json`;
  const outputPath = `${tempDir}/output.json`;

  try {
    const input = {
      invariantReport: {
        index_chain_checked: true,
        index_chain_ok: true,
        index_chain_checked_records: 1,
        index_chain_failures: [],
        gate_admission_index_chain_checked: true,
        gate_admission_index_chain_ok: true,
        gate_admission_index_chain_checked_records: 1,
        gate_admission_index_chain_failures: [],
      },
      tick_anchor: 1,
      witness: "cli-test",
    };
    await Deno.writeTextFile(inputPath, JSON.stringify(input, null, 2));

    const cmd = new Deno.Command("deno", {
      args: [
        "run",
        "-A",
        "4/0/GATE_RUNNER_CLI/_.ts",
        "--packet",
        "--input",
        inputPath,
        "--output",
        outputPath,
        "--pretty",
      ],
      cwd: "/Users/s0fractal/OMEGA",
    });

    const res = await cmd.output();
    if (!res.success) {
      const stderr = new TextDecoder().decode(res.stderr);
      throw new Error(`CLI failed: ${stderr}`);
    }

    const outputRaw = await Deno.readTextFile(outputPath);
    const output = JSON.parse(outputRaw);
    if (output.version !== "invariant-packet/v1") {
      throw new Error(
        `expected invariant packet version, got ${output.version}`,
      );
    }
    if (!output.packet_hash) {
      throw new Error("expected packet_hash in invariant packet output");
    }
  } finally {
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch { /* ignore */ }
  }
});

Deno.test("gate runner cli verifies invariant packet", async () => {
  const tempDir = await Deno.makeTempDir({ prefix: "omega-gate-runner-cli-" });
  const inputPath = `${tempDir}/input.json`;
  const outputPath = `${tempDir}/output.json`;

  try {
    const packet = await INVARIANT_PACKET.seal({
      tick_anchor: 1,
      canon_index_chain_checked: true,
      canon_index_chain_ok: true,
      gate_admission_index_chain_checked: true,
      gate_admission_index_chain_ok: true,
      ledger_chain_checked: true,
      ledger_chain_ok: true,
      witness: "cli-test",
    });
    await Deno.writeTextFile(inputPath, JSON.stringify(packet, null, 2));

    const cmd = new Deno.Command("deno", {
      args: [
        "run",
        "-A",
        "4/0/GATE_RUNNER_CLI/_.ts",
        "--verify-packet",
        "--input",
        inputPath,
        "--output",
        outputPath,
        "--pretty",
      ],
      cwd: "/Users/s0fractal/OMEGA",
    });

    const res = await cmd.output();
    if (!res.success) {
      const stderr = new TextDecoder().decode(res.stderr);
      throw new Error(`CLI failed: ${stderr}`);
    }

    const outputRaw = await Deno.readTextFile(outputPath);
    const output = JSON.parse(outputRaw);
    if (!output.ok) {
      throw new Error(`expected verify ok, got: ${outputRaw}`);
    }
  } finally {
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch { /* ignore */ }
  }
});
