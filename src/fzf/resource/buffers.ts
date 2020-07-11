import { getOtherBuffers } from "@/connector/buffers"
import { filePreviewCommand } from "@/fzf/util"
import { cacheSelector } from "@/module/selector/cache"
import { isGitDirectory } from "@/system/project"
import type {
  ConvertedLine,
  FzfCommandDefinitionDefaultOption,
  ResourceLines,
  SelectedLine,
  SourceFuncArgs,
  VimBuffer,
} from "@/type"

const bufferToString = (buffer: VimBuffer) => {
  if (buffer.modified) {
    return `+ ${buffer.fileName}`
  } else {
    return buffer.fileName
  }
}

export const buffers = async (_args: SourceFuncArgs): Promise<ResourceLines> => {
  const bufferList = await getOtherBuffers()

  // TODO: sort with mru
  if (!isGitDirectory()) {
    return bufferList.map((buffer) => buffer.fileName)
  }

  const { mruFiles } = cacheSelector()

  const sortedBufferList = mruFiles
    .map<VimBuffer | undefined>((file) => bufferList.find((buffer) => buffer.fileName === file))
    .filter((buffer): buffer is VimBuffer => buffer != null)

  return Array.from(new Set(sortedBufferList.concat(bufferList))).map((buffer) => bufferToString(buffer))
}

export const dropBufferPrefix = (line: SelectedLine): ConvertedLine => {
  const result = /\+ (?<fileName>\S+)/.exec(line)
  if (result == null) {
    return line
  }

  if (result.groups) {
    return result.groups.fileName
  }

  throw new Error(`Unexpected buffer line: "${line}"`)
}

export const buffersDefaultOptions = (): FzfCommandDefinitionDefaultOption => ({
  "--prompt": '"Buffers> "',
  "--multi": true,
  "--preview": filePreviewCommand(),
})
