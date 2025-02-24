# Moeru AI Blog

## Development

```bash
deno task build # build
deno task serve # serve
deno task cms # cms
```

## Writing new post

Only Moeru AI members can add new posts. (nonetheless, all typo fix are welcome)

Add a new `.md` file to `src/posts` based on the following format:

```ts
interface Data {
  title: string
  date: string // 'YYYY-MM-DD'
  author: string // multiple authors example: 'Foo, Bar'
  tags?: string[]
}
```

Have fun!
