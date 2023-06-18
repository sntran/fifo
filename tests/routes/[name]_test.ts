import { createHandler } from "$fresh/server.ts";
import manifest from "../../fresh.gen.ts";
import { assert, assertEquals, assertFalse } from "$std/testing/asserts.ts";
import type { ConnInfo } from "$std/http/server.ts";
import * as Snowflake from "snowflake";

const CONN_INFO: ConnInfo = {
  localAddr: { hostname: "127.0.0.1", port: 8000, transport: "tcp" },
  remoteAddr: { hostname: "127.0.0.1", port: 53496, transport: "tcp" },
};

Deno.test("HTTP assert test.", async (t) => {
  const handler = await createHandler(manifest);

  const name = "/foo";
  const url = `http://127.0.0.1${name}`;

  await t.step("GET /:name", async () => {
    const response = await handler(new Request(url), CONN_INFO);
    assertEquals(response.status, 200);
    assert((await response.text()).includes(name));
  });

  await t.step("PATCH /:name", async () => {
    const formData = new FormData();
    formData.append("edge[sourceId]", name);
    formData.append("edge[targetId]", Snowflake.generate());
    formData.append("edge[target][method]", "POST");
    formData.append("edge[target][url]", "https://example.net");

    // Inserts
    let request = new Request(url, {
      method: "PATCH",
      body: formData,
    });
    let response = await handler(request, CONN_INFO);
    assertEquals(response.status, 204);

    response = await handler(new Request(url), CONN_INFO);
    let body = await response.text();
    assert(
      body.includes("https://example.net"),
      "body should contains the new node URL",
    );

    // Updates
    formData.set("edge[target][url]", "https://example.com");
    request = new Request(url, {
      method: "PATCH",
      body: formData,
    });
    response = await handler(request, CONN_INFO);
    assertEquals(response.status, 204);

    response = await handler(new Request(url), CONN_INFO);
    body = await response.text();
    assertFalse(
      body.includes("https://example.net"),
      "body should not contain old value",
    );
    assert(
      body.includes("https://example.com"),
      "body should contain new value",
    );

    // Deletes
    formData.append("_action", "delete");
    request = new Request(url, {
      method: "PATCH",
      body: formData,
    });
    response = await handler(request, CONN_INFO);
    assertEquals(response.status, 204);

    response = await handler(new Request(url), CONN_INFO);
    body = await response.text();
    assertFalse(
      body.includes("https://example.com"),
      "body should not contain the deleted node",
    );
  });
});
