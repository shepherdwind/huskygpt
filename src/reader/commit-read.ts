import path from 'path';
import { readPromptFile } from 'src/utils/read-prompt-file';
export interface IFileDiff {
  source: string;
  filename: string;
  mode: EFileDiffType;
  diff: string;
  add: number;
  del: number;
}

const PriorityFileTypes = {
  '.ts': 10000,
  '.tsx': 10000,
  '.js': 10000,
  '.less': 100,
  '.json': 100,
}

enum PromptFile {
  summarize_file_diff = 'summarize_file_diff',
  label = 'commit_label',
  body = 'commit_body',
  title = 'commit_title',
}
  private parseFile(file: string): IFileDiff {
  private sortAndFilter(files: IFileDiff[]) {
    const sortedFiles = files.sort((a, b) => {
      const aExt = path.extname(a.filename).slice(1);
      const bExt = path.extname(b.filename).slice(1);
      const priorityA = PriorityFileTypes[aExt] || 1;
      const priorityB = PriorityFileTypes[bExt] || 1;
      // delete should be last
      if (a.mode === EFileDiffType.DELETE) {
        return 1;
      }
      if (b.mode === EFileDiffType.DELETE) {
        return -1;
      }
      return (b.add + b.del) * priorityB - (a.add + a.del) * priorityA;
    });

    return sortedFiles;
  }

    const sorted = this.sortAndFilter(files.map((file) => this.parseFile(file)));
    return sorted;
  }

  getFilePrompts(diffFile?: string, len = 5) {
    const files = this.getFileList(diffFile);
    const prompt = this.getPrompt(PromptFile.summarize_file_diff);
    // no more than 5 files
    return files.slice(0, len).map((file, i) => {
      return {
        fileName: file.filename,
        prompt: prompt.replace('{{ file_diff }}', file.diff)
      };
    });
  }

  getSummaryPrompts(summary: string) {
    const label = this.getPrompt(PromptFile.label);
    const body = this.getPrompt(PromptFile.body);
    const title = this.getPrompt(PromptFile.title);
    return [
      label, title, body
    ].map((prompt) => prompt.replace('{{ summary_points }}', summary));
  }

  private getPrompt(filename: PromptFile) {
    return readPromptFile(`${filename}.txt`);