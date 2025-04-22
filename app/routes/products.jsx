import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";

import {
  Layout,
  Page,
  Card,
  Text
} from "@shopify/polaris";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query {
        products(first: 10) {
          edges {
            node {
              id
              title
              handle
            }
            cursor
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `
  )

  const { data: product } = await response.json();
}

export default function products() {
  const products = useLoaderData();

  return (
    <Page title="Products">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            {products.map((product) => (
              <Text key={product.id}>
                {product.title} - {product.handle}
              </Text>
            ))}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}