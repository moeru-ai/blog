import lume from 'lume/mod.ts'
import blog from 'blog/mod.ts'

export default lume({
  src: './src',
})
  .use(blog())
  // remove /posts prefix
  // https://lume.land/docs/core/processors/#preprocess
  .preprocess(['.html'], pages => {
    for (const page of pages) {
      if (page.data.url.startsWith('/posts')) {
        page.data.url = page.data.url.slice('/posts'.length)
      }
    }
  })
  // remove author page
  // https://lume.land/docs/core/processors/#remove-pages-dynamically
  .process(['.html'], (filteredPages, allPages) => {
    for (const page of filteredPages) {
      if (page.data.url.startsWith('/author')) {
        allPages.splice(allPages.indexOf(page), 1)
      }
    }
  })
