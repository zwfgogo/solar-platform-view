interface PageProps {
  pageId: number
  parentPageNeedUpdate: (type?: string, data?: any) => void
  back: (count?: number) => void
  forward: (name: string, data?: Record<string, any>) => void
  replace: (name: string, data?: Record<string, any>) => void
}

export default PageProps
