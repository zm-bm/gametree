resource "aws_iam_role" "api" {
  name = "gametree-api-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(local.tags, {
    Name = "gametree-api-role"
  })
}

resource "aws_iam_policy" "api_s3_read" {
  name        = "gametree-api-s3-read"
  description = "Read RocksDB files from S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = ["arn:aws:s3:::${var.rocksdb_s3_bucket}"]
      },
      {
        Effect = "Allow"
        Action = ["s3:GetObject"]
        Resource = [
          "arn:aws:s3:::${var.rocksdb_s3_bucket}/*"
        ]
      }
    ]
  })

  tags = merge(local.tags, {
    Name = "gametree-api-s3-read"
  })
}

resource "aws_iam_role_policy_attachment" "api_s3_read" {
  role       = aws_iam_role.api.name
  policy_arn = aws_iam_policy.api_s3_read.arn
}

resource "aws_iam_role_policy_attachment" "api_ssm_core" {
  role       = aws_iam_role.api.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "api_ecr_read_only" {
  role       = aws_iam_role.api.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "api" {
  name = "gametree-api-profile"
  role = aws_iam_role.api.name
}
