import { MDXProvider } from '@mdx-js/react'
import { useLocation } from '@reach/router'
import { Blockquote } from 'components/BlockQuote'
import CommunityQuestions from 'components/CommunityQuestions'
import { Heading } from 'components/Heading'
import { InlineCode } from 'components/InlineCode'
import Layout from 'components/Layout'
import Link from 'components/Link'
import PostLayout, { Contributors, PageViews, ShareLinks, SidebarSection, Topics } from 'components/PostLayout'
import { SEO } from 'components/seo'
import { ZoomImage } from 'components/ZoomImage'
import { useBreakpoint } from 'gatsby-plugin-breakpoints'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import { graphql } from 'gatsby'
import React, { useEffect, useState } from 'react'
import { animateScroll as scroll } from 'react-scroll'
import { shortcodes } from '../../mdxGlobalComponents'
import slugify from 'slugify'
import { CodeBlock } from 'components/CodeBlock'
import MobileSidebar from 'components/Docs/MobileSidebar'

const Iframe = (props) => {
    if (props.src && props.src.indexOf('youtube.com') !== -1) {
        return (
            <div style={{ position: 'relative', height: 0, paddingBottom: '56.25%' }}>
                <iframe {...props} className="absolute top-0 left-0 w-full h-full" />
            </div>
        )
    } else {
        return <iframe {...props} />
    }
}

const ViewButton = ({ title, view, setView }) => {
    return (
        <button
            onClick={() => setView(title)}
            style={{
                background: view === title ? '#F54E00' : '#E5E7E0',
                color: view === title ? 'white' : 'black',
            }}
            className="py-2 px-4 rounded-md w-1/2 transition-colors"
        >
            {title}
        </button>
    )
}

const A = (props) => <Link {...props} className="text-red hover:text-red font-semibold" />

const TutorialSidebar = ({ contributors, location, title, pageViews, categories }) => {
    return (
        <>
            {contributors?.length > 0 && (
                <SidebarSection title={`Contributor${contributors?.length > 1 ? 's' : ''}`}>
                    <Contributors
                        className="flex flex-col space-y-2"
                        contributors={contributors.map((contributor) => ({
                            ...contributor,
                        }))}
                    />
                </SidebarSection>
            )}
            <SidebarSection title="Share">
                <ShareLinks title={title} href={location.href} />
            </SidebarSection>
            {pageViews && (
                <SidebarSection>
                    <PageViews pageViews={pageViews.toLocaleString()} />
                </SidebarSection>
            )}
            {categories?.length > 0 && (
                <SidebarSection title="Filed under...">
                    <Topics
                        topics={categories?.map((category) => ({
                            name: category,
                            url: `/tutorials/categories/${slugify(category, { lower: true })}`,
                        }))}
                    />
                </SidebarSection>
            )}
        </>
    )
}

export default function Tutorial({ data, pageContext: { pageViews, tableOfContents, menu }, location }) {
    const { pageData } = data
    const { body, excerpt, fields } = pageData
    const { title, featuredImage, description, contributors, categories, featuredVideo } = pageData?.frontmatter
    const components = {
        iframe: Iframe,
        inlineCode: InlineCode,
        blockquote: Blockquote,
        pre: CodeBlock,
        img: ZoomImage,
        h1: (props) => Heading({ as: 'h1', ...props }),
        h2: (props) => Heading({ as: 'h2', ...props }),
        h3: (props) => Heading({ as: 'h3', ...props }),
        h4: (props) => Heading({ as: 'h4', ...props }),
        h5: (props) => Heading({ as: 'h5', ...props }),
        h6: (props) => Heading({ as: 'h6', ...props }),
        a: A,
        ...shortcodes,
    }
    const { hash } = useLocation()
    const breakpoints = useBreakpoint()
    const [view, setView] = useState('Article')

    useEffect(() => {
        if (hash) {
            scroll.scrollMore(-50)
        }
    }, [])

    return (
        <Layout>
            <SEO
                title={title + ' - PostHog'}
                description={description || excerpt}
                article
                image={`/og-images/${fields.slug.replace(/\//g, '')}.jpeg`}
            />
            <PostLayout
                questions={<CommunityQuestions />}
                body={body}
                featuredImage={featuredImage}
                featuredVideo={featuredVideo}
                tableOfContents={tableOfContents}
                title={title}
                menu={menu}
                sidebar={
                    <TutorialSidebar
                        contributors={contributors}
                        location={location}
                        title={title}
                        pageViews={pageViews}
                        categories={categories}
                    />
                }
            >
                <h1 className="text-4xl mb-6 mt-0">{title}</h1>
                <GatsbyImage
                    className="mb-6 bg-[#E5E7E0] dark:bg-[#2C2C2C] rounded-md"
                    image={getImage(featuredImage)}
                />
                {featuredVideo && (
                    <div className="mb-6 flex space-x-2">
                        <ViewButton view={view} title="Article" setView={setView} />
                        <ViewButton view={view} title="Video" setView={setView} />
                    </div>
                )}
                {view === 'Article' && breakpoints.md && <MobileSidebar tableOfContents={tableOfContents} />}
                {view === 'Article' ? (
                    <div className="article-content">
                        <MDXProvider components={components}>
                            <MDXRenderer>{body}</MDXRenderer>
                        </MDXProvider>
                    </div>
                ) : (
                    <Iframe src={featuredVideo} />
                )}
            </PostLayout>
        </Layout>
    )
}

export const query = graphql`
    query TutorialLayout($id: String!) {
        pageData: mdx(id: { eq: $id }) {
            body
            excerpt(pruneLength: 150)
            fields {
                slug
            }
            frontmatter {
                title
                description
                categories: topics
                contributors: authorData {
                    id
                    image {
                        childImageSharp {
                            gatsbyImageData(width: 38, height: 38)
                        }
                    }
                    name
                }
                featuredVideo
                featuredImage {
                    publicURL
                    childImageSharp {
                        gatsbyImageData(placeholder: NONE)
                    }
                }
            }
        }
    }
`
