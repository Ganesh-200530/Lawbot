#!/bin/bash
echo "Starting deployment..."
if [ ! -d "Lawbot" ]; then
  git clone https://github.com/Ganesh-200530/Lawbot.git
  cd Lawbot
else
  cd Lawbot
  git pull
fi

echo "Installing system dependencies..."
export DEBIAN_FRONTEND=noninteractive
sudo apt update
sudo apt-get install -y python3-venv python3-pip nginx unzip curl

echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Setting up Python backend..."
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

echo "Restarting Gunicorn..."
pkill gunicorn || true
nohup gunicorn -w 4 -b 0.0.0.0:5000 run:app > backend.log 2>&1 &

echo "Setting up React frontend..."
cd frontend
npm install
npm run build

echo "Deploying frontend to Nginx..."
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
sudo systemctl restart nginx

echo "Deployment complete! Application is running on http://98.93.111.34"
