import { Head } from "$fresh/runtime.ts";
import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import Navigator from "../islands/Navigator.tsx";

export const handler: Handlers = {
  GET(request: Request, context: HandlerContext) {
    const { searchParams, origin } = new URL(request.url);
    const name = searchParams.get("name");

    if (name) {
      return Response.redirect(`${origin}/${name}`);
    }

    return context.render({
      // TODO: Load placeholders from actual existing public FIFOs.
      placeholders: [
        "some-cool-name",
        "another-cool-name",
        "yet-another-cool-name",
        "and-another-cool-name",
      ],
    });
  },
};

export default function Home({ data }: PageProps) {
  return (
    <>
      <Head>
        <title>mkfifo</title>
      </Head>
      <main class="p-4 mx-auto max-w-screen-md">
        <img
          src="/logo.svg"
          class="w-32 h-32"
          alt="the fresh logo: a sliced lemon dripping with juice"
        />
        <p class="my-6">
          Welcome to `mkfifo`. Enter the FIFO name you want to make or use.
        </p>
        <Navigator placeholders={data.placeholders} />
      </main>
    </>
  );
}
