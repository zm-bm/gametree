// Security group for gametree-api instances.
resource "aws_security_group" "api" {
  name        = "gametree-api-sg"
  description = "gametree-api instances (health check + app)"
  vpc_id      = data.terraform_remote_state.network.outputs.vpc_id

  ingress {
    description     = "gametree-api from edge ALB"
    from_port       = local.api_port
    to_port         = local.api_port
    protocol        = "tcp"
    security_groups = [data.terraform_remote_state.edge.outputs.alb_security_group_id]
  }

  ingress {
    description = "ssh access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags, {
    Name = "gametree-api-sg"
  })
}
