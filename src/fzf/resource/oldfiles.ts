import { convertForFzf } from "@/connector/convert-for-fzf"
import { getOldFiles } from "@/connector/old-files"
import { executeCommandSelector } from "@/module/selector/execute-command"
import { globalVariableSelector } from "@/module/selector/vim-variable"
import { collapseHome, existsFile } from "@/system/file"
import type { FzfCommandDefinitionDefaultOption, ResourceLines, SourceFuncArgs } from "@/type"

export const oldFiles = async (_args: SourceFuncArgs): Promise<ResourceLines> => {
  const files = (await getOldFiles()).filter((file) => existsFile(file))

  const { enableDevIcons } = executeCommandSelector().options
  if (enableDevIcons) {
    const convertedFiles = await convertForFzf(files)
    return convertedFiles.map((file) => collapseHome(file))
  } else {
    return files.map((file) => collapseHome(file))
  }
}

export const oldFilesDefaultOptions = (): FzfCommandDefinitionDefaultOption => ({
  "--prompt": '"OldFiles> "',
  "--multi": true,
  "--preview": `"${globalVariableSelector("fzfPreviewCommand") as string}"`,
})
