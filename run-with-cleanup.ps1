# Build and start all containers in detached mode
docker-compose up --build -d

# Wait for kafka-init container to finish
Write-Host "Waiting for kafka-init to finish..."

# Get the container ID or name (update this if your project uses a prefix)
$containerName = "healthcare_microservices-topic-init-1"

# Wait for container to exit
docker wait $containerName

# Get exit status
$status = docker inspect -f "{{.State.ExitCode}}" $containerName

# Remove it if it exited successfully
if ($status -eq 0) {
    Write-Host "Init finished successfully, removing container..."
    docker rm $containerName
} else {
    Write-Host "Init failed with status $status. Not removing container."
}
