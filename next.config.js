module.exports = {
  async rewrites() {
    return [
      {
        source: "/faq",
        destination: "/index.html",
      },
    ]
  },
}