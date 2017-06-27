import React from 'react'
import 'css/markdown-styles.css'
import Helmet from 'react-helmet'
import { config } from 'config'

function formatDate(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return `${monthNames[monthIndex]} ${day}, ${year}`;
}

module.exports = React.createClass({
    propTypes () {
        return {
            router: React.PropTypes.object,
        }
  },
  render () {
    const post = this.props.route.page.data
    const date = formatDate(new Date(this.props.route.page.data.date));

    return (
      <div className="markdown">
        <Helmet
          title={`${config.siteTitle} | ${post.title}`}
        />
        { this.props.route.page.path === "/404.html" ? null :
        <div className="header">
          <h1>{post.title}</h1>
          <span>Posted on {date}</span>
            </div>
        }

        <div dangerouslySetInnerHTML={{ __html: post.body }} />
      </div>
    )
  },
})
