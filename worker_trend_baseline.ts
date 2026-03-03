type BaselineBootstrapOptions<TCurrent, TBaseline> = {
  baselinePath: string;
  bootstrapEnv: string;
  current: TCurrent;
  baselineFromCurrent: (current: TCurrent) => TBaseline;
  missingErrorMessage: (path: string, envVar: string) => string;
  createdLogMessage: (path: string) => string;
};

export const loadTrendBaselineWithBootstrap = async <TCurrent, TBaseline>(
  options: BaselineBootstrapOptions<TCurrent, TBaseline>,
): Promise<TBaseline> => {
  const {
    baselinePath,
    bootstrapEnv,
    current,
    baselineFromCurrent,
    missingErrorMessage,
    createdLogMessage,
  } = options;

  try {
    const raw = await Deno.readTextFile(baselinePath);
    return JSON.parse(raw) as TBaseline;
  } catch {
    const bootstrap = Deno.env.get(bootstrapEnv) === "1";
    if (!bootstrap) {
      throw new Error(missingErrorMessage(baselinePath, bootstrapEnv));
    }
    const baseline = baselineFromCurrent(current);
    await Deno.writeTextFile(baselinePath, JSON.stringify(baseline, null, 2));
    console.log(createdLogMessage(baselinePath));
    return baseline;
  }
};
