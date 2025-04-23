import { json } from "@remix-run/node";
8
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";

import {
  Layout,
  Page,
  Card,
  Text,
  Thumbnail,
  IndexTable
} from "@shopify/polaris";

import { ImageIcon } from "@shopify/polaris-icons";

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
              category {
                id
              }
              media(first: 1) {
                edges {
                  node {
                    __typename
                    ... on MediaImage {
                      id
                      image {
                        originalSrc
                        altText
                      }
                    }
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    price
                  }
                }
              }
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
  return { product, apiKey: process.env.SHOPIFY_API_KEY || "" };
}

export default function products() {
  const { product: { products: { edges } }, apiKey } = useLoaderData();

  return (
    <Page>
      <Layout>
        <Layout.Section>
        <Card padding="0">
          <IndexTable
            resourceName={{
              singular: "product list",
              plural: "product list"
            }}
            itemCount={edges.length}
            headings={[
              { title: "Thumbnail", hidden: true },
              { title: "Title" },
              { title: "Price"}
            ]}
            selectable={false}
          >
            { edges?.map(product => {
              return (
                <IndexTable.Row id={product.cursor} position={product.cursor}>
                  <IndexTable.Cell>
                    <Thumbnail
                      source={product.node.media?.edges[0]?.node?.image?.originalSrc || ImageIcon}
                      alt={product.node.media?.edges[0]?.node?.image?.altText}
                      size="small"
                    />
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text>{product.node.title}</Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text>{product.node.variants.edges[0].node.price}</Text>
                  </IndexTable.Cell>
                </IndexTable.Row>
              )
            })}
          </IndexTable>
        </Card>
        <Text>{ JSON.stringify(edges) }</Text>
        </Layout.Section>
      </Layout>
    </Page>
  );
}