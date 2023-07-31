import chalk from 'chalk';

import {
  AIGenerateTextTrace,
  FunctionExec,
  GenerateTextModelConfig,
  GenerateTextResponse,
  TextModelInfo,
} from '../text/types';

export class ConsoleLogger {
  private traceIndex = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private print(message: string, value: any, indent = 0): void {
    const prefix = ' '.repeat(indent * 2);
    console.log(
      `${prefix}${chalk.underline(message)}: ${
        value !== undefined ? chalk.bold(value) : chalk.gray('<not-set>')
      }`
    );
  }

  private printModelInfo(info: Readonly<TextModelInfo | undefined>): void {
    if (!info) return;

    console.log(chalk.green(`\n📘 Model Info:`));
    this.print('ID', info.id, 1);
    this.print('Currency', info.currency, 1);
    this.print('Character Is Token', info.characterIsToken, 1);
    this.print('Prompt Token Cost Per 1K', info.promptTokenCostPer1K, 1);
    this.print(
      'Completion Token Cost Per 1K',
      info.completionTokenCostPer1K,
      1
    );
    this.print('Max Tokens', info.maxTokens, 1);
    this.print('One TPM', info.oneTPM, 1);
  }

  private printModelConfig(
    config: Readonly<GenerateTextModelConfig | undefined>
  ): void {
    if (!config) return;

    console.log(chalk.yellow(`\n🛠️  Model Config:`));
    Object.entries(config).forEach(([key, value]) => {
      this.print(key, value, 1);
    });
  }

  private printFunctionExec(
    functionExecs: Readonly<FunctionExec[] | undefined>
  ): void {
    if (!functionExecs) return;

    console.log(chalk.blue(`\n🚀 Function Executions:`));
    functionExecs.forEach((func, i) => {
      this.print(`Function ${i + 1}`, func.name, 1);
      this.print('Arguments', JSON.stringify(func.args), 1);
      this.print('Result', func.result, 1);
      this.print('Result Value', JSON.stringify(func.resultValue), 1);
      this.print('Reasoning', func.reasoning?.join(', '), 1);
      if (func.parsingError) {
        this.print('Parsing Error', func.parsingError.error, 1);
        this.print('Data', func.parsingError.data, 1);
      }
    });
  }

  private printGenerateTextResponse(
    resp: Readonly<GenerateTextResponse>
  ): void {
    console.log(chalk.blue(`\n🚀 Generate Text Responses:`));
    this.print('Remote ID', resp.remoteID, 1);
    resp.results.forEach((result, j) => {
      this.print(`Result ${j + 1}`, result.text, 2);
      this.print('Result ID', result.id, 2);
      this.print('Finish Reason', result.finishReason, 2);
    });
    this.print('Model Usage', JSON.stringify(resp.modelUsage), 1);
    this.print('Embed Model Usage', JSON.stringify(resp.embedModelUsage), 1);
  }

  public log(trace: Readonly<AIGenerateTextTrace>): void {
    console.log(
      chalk.bold.cyan(`\n🔎 Trace ${this.traceIndex + 1}\n` + '_'.repeat(50))
    );
    this.print('Trace ID', trace.traceID, 1);
    this.print('Session ID', trace.sessionID, 1);
    this.print('Prompt', trace.request.prompt, 1);

    this.printModelInfo(trace.request.modelInfo);
    this.printModelConfig(trace.request.modelConfig);
    this.printModelInfo(trace.request.embedModelInfo);

    if (trace.response) {
      console.log(chalk.magenta(`\n📝 Response:`));
      this.printGenerateTextResponse(trace.response as GenerateTextResponse);
      this.print('Model Response Time', trace.response.modelResponseTime, 1);
      this.print(
        'Embed Model Response Time',
        trace.response.embedModelResponseTime,
        1
      );
      this.printFunctionExec(trace.response.functions);
      if (trace.response.parsingError) {
        this.print('Parsing Error', trace.response.parsingError.error, 1);
        this.print('Data', trace.response.parsingError.data, 1);
      }
      if (trace.response.apiError) {
        console.log(chalk.red(`\n❌ API Error:`));
        this.print('Message', trace.response.apiError, 1);
      }
    }
    this.traceIndex++;
  }
}