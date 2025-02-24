import lume from 'lume/mod.ts'
import blog from 'blog/mod.ts'

export default lume({
  src: './src',
}).use(blog())
