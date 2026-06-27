// Autoscaling group for gametree-api instances.
resource "aws_autoscaling_group" "api" {
  name                      = "gametree-api-asg"
  min_size                  = local.asg_min
  max_size                  = local.asg_max
  desired_capacity          = local.asg_desired
  health_check_type         = "ELB"
  health_check_grace_period = 1200

  vpc_zone_identifier = data.terraform_remote_state.network.outputs.public_subnet_ids
  target_group_arns   = [data.terraform_remote_state.edge.outputs.gametree_api_target_group_arn]

  launch_template {
    id      = aws_launch_template.api.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "gametree-api"
    propagate_at_launch = true
  }

  tag {
    key                 = "app"
    value               = "gametree-api"
    propagate_at_launch = true
  }

  tag {
    key                 = "ManagedBy"
    value               = "terraform"
    propagate_at_launch = true
  }

  tag {
    key                 = "Stack"
    value               = "gametree-api"
    propagate_at_launch = true
  }
}
