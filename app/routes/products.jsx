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
    `
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

  return product;
}

export default function products() {
  const { products: edges } = useLoaderData();

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            
            { edges.map(product => 
              <Text>{ product.id }</Text>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}