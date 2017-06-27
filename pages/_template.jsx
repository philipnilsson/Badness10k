import React from 'react'
import { Container } from 'react-responsive-grid'
import { Link } from 'react-router'
import { prefixLink } from 'gatsby-helpers'
import Headroom from 'react-headroom'
import '../css/markdown-styles'

import { rhythm } from '../utils/typography'

const twitter = <div id="footer">
    <a type="application/rss+xml" href="http://philipnilsson.github.io/Badness10k/atom.xml">
        RSS feed for this page
    </a>
    <a href="https://twitter.com/ali_pang"
       className="twitter-follow-button"
       data-show-count="false"
       data-size="large"
    >
        Follow @ali_pang
    </a>
</div>;

module.exports = React.createClass({

    componentDidMount() {
        this.mount(this.props);
    },

    componentDidUpdate(props) {
        this.mount(props);
    },

    mount(props) {
        if (window.MathJax) {
            window.MathJax.Hub.Typeset();
        }
        const url = props.location.pathname === '/escaping-hell-with-monads/'
                  ? '/posts/2017-05-07-escaping-hell-with-monads.html'
                  : props.location.pathname;

        window.disqus_config = function () {
            this.page.url = `https://philipnilsson.github.io/Badness10k${props.location.pathname}`;
            this.page.identifier = document.title;
            console.log('URL!', this.page.url);
        };
        if (window.DISQUS) {
            window.DISQUS.reset({ reload: true, config: window.disqus_config });
        } else {
            var d = document, s = d.createElement('script');
            s.src = 'https://badness-10-000.disqus.com/embed.js';
            s.setAttribute('data-timestamp', +new Date());
            (d.head || d.body).appendChild(s);
        }
    },

    propTypes () {
        return {
            children: React.PropTypes.any,
        }
    },
    render () {
        return (
            <div>
                <Headroom
                    wrapperStyle={{
                        marginBottom: rhythm(1),
                    }}
                    style={{
                        background: '#1244ee',
                    }}>
                    <Container
                        style={{
                            maxWidth: '40rem',
                            paddingTop: 0,
                            padding: `${rhythm(1/2)} ${rhythm(3/4)}`,
                        }}>
                        <Link
                            to={prefixLink('/')}
                            to={prefixLink('/')}
                            style={{
                                color: 'black',
                                textDecoration: 'none',
                            }}
                        >
                            <h2 style={{ float: 'left'}}>Badness 10.000</h2>
                            <a className="twitter-bird" href="//www.twitter.com/ali_pang" style={{float: 'right'}}>
                                <img src="https://g.twimg.com/dev/documentation/image/Twitter_logo_blue_48.png" style={{ margin: '0', filter: 'brightness(4)', maxHeight: '2.1rem' }}/>
                            </a>

                        </Link>
                    </Container>
                </Headroom>
                <Container
                    style={{
                        maxWidth: '40rem',
                        padding: `${rhythm(1)} ${rhythm(3/4)}`,
                        paddingTop: 0,
                    }}>
                    {this.props.children}
                    {twitter}
                    <div id="disqus_thread"/>
                </Container>
            </div>
        )
    },
})
