set -v

# Install logging monitor. The monitor will automatically pick up logs sent to
# syslog.
curl -s "https://storage.googleapis.com/signals-agents/logging/google-fluentd-install.sh" | bash
service google-fluentd restart &

# Install dependencies from apt
apt-get update
apt-get install -yq ca-certificates git build-essential

# Install nodejs
mkdir /opt/nodejs
curl https://nodejs.org/dist/v8.12.0/node-v8.12.0-linux-x64.tar.gz | tar xvzf - -C /opt/nodejs --strip-components=1
ln -s /opt/nodejs/bin/node /usr/bin/node
ln -s /opt/nodejs/bin/npm /usr/bin/npm

# Get the application source code from the Google Cloud Repository.
# git requires $HOME and it's not set during the startup script.
export HOME=/root
git config --global credential.helper gcloud.sh
git clone https://github.com/larsksy/pingpog.git /opt/app/pingpog

# Install app dependencies
cd /opt/app/pingpog
npm install

# Create a nodeapp user. The application will run as this user.
/usr/sbin/useradd -m -d /home/nodeapp nodeapp
chown -R nodeapp:nodeapp /opt/app

# Setup bucket symlink
mkdir bucket
export GCSFUSE_REPO=gcsfuse-`lsb_release -c -s`
echo "deb http://packages.cloud.google.com/apt $GCSFUSE_REPO main" | sudo tee /etc/apt/sources.list.d/gcsfuse.list
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
apt-get update
apt-get install -yq gcsfuse
gcsfuse user-elo ./bucket

# Configure supervisor to run the node app.
cat >/lib/systemd/system/pingpog.service << EOF
[Unit]
Description=Runs PingPOG Backend Service
After=network.target
[Service]
Environment=PORT=3000
Type=simple
User=root
WorkingDirectory=/opt/app/pingpog
ExecStart=/usr/bin/node /opt/app/pingpog/bin/www
Restart=on-failure
[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl start pingpog
