output "sites" {
  description = "Static site outputs keyed by site identifier."
  value = {
    gametree = module.static_site
  }
}
