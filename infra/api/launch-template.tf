// Launch template for gametree-api instances.
resource "aws_launch_template" "api" {
  name_prefix   = "gametree-api-"
  image_id      = local.al2023_ami_id
  instance_type = local.instance_type
  key_name      = var.ssh_key_name

  vpc_security_group_ids = [aws_security_group.api.id]

  iam_instance_profile {
    name = aws_iam_instance_profile.api.name
  }

  block_device_mappings {
    device_name = "/dev/xvda"

    ebs {
      volume_size           = local.root_volume_gb
      volume_type           = "gp3"
      delete_on_termination = true
    }
  }

  user_data = base64encode(templatefile("${path.module}/templates/gametree-api-userdata.sh.tmpl", {
    rocksdb_s3_uri    = local.rocksdb_s3_uri
    api_image         = var.api_image
    cors_allow_origin = var.cors_allow_origin
  }))

  tag_specifications {
    resource_type = "instance"
    tags = merge(local.tags, {
      Name = "gametree-api"
    })
  }

  tag_specifications {
    resource_type = "volume"
    tags = merge(local.tags, {
      Name = "gametree-api"
    })
  }
}
