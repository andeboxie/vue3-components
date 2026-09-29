const modules = import.meta.glob('../../assets/icons/*.svg', {
    eager: true, // 1. 同步加载：构建时直接打包内容，运行时返回模块对象而非 Promise函数
    query: '?raw', // 2. 原始内容：告诉 Vite 将文件作为字符串导入，而不是作为 URL 或模块
    import: 'default' // 3. 指定导出：只获取默认导出（对于 ?raw 模式，默认导出即为文件内容的字符串）
}) as Record<string, string>;

// 导出 composable：传入 name，返回对应 SVG 内容（不存在则 undefined）
export function useIcon(name: string): string | undefined {
    // glob 的 key 是相对路径，如 '../../assets/icons/check.svg'
    return modules[`../../assets/icons/${name}.svg`];
}
