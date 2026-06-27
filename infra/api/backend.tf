terraform {
  backend "s3" {
    bucket       = "zmbm-tf-state-bucket"
    key          = "gametree-api/prod.tfstate"
    region       = "us-east-1"
    profile      = "admin"
    use_lockfile = true
  }
}
