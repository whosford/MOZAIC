use std::process::{Command, Stdio};
use futures::{Future, Poll};
use tokio_process::{Child, ChildStdin, ChildStdout, CommandExt};


use tokio_core::reactor::{Handle, Core};

use std::io::{Read, Write, Error, Result};
use tokio_io::{AsyncRead, AsyncWrite};


use game::*;
use match_runner::*;

// A collection of running bots (i.e. process handles)
pub struct BotRunner {
    // Maps player ids to their process handles
    processes: PlayerMap<Child>,
}

impl BotRunner {
    pub fn run(handle: &Handle, players: &PlayerMap<PlayerConfig>) -> Self {
        BotRunner {
            processes: players.iter().map(|(&id, config)| {
                let mut cmd = Command::new(&config.command);
                cmd.args(&config.args);
                cmd.arg(format!("{}", config.name.as_str()));

                let handle = BotHandle::spawn(cmd, handle)
                    .expect(&format!(
                        "\n[DRIVER] Failed to execute process: {} {:?}\n",
                        config.command,
                        config.args
                    ));
                unimplemented!()
            }).collect()
        }
    }

    // pub fn player_handles<'p>(&'p mut self) -> PlayerMap<PlayerHandle<'p>> {
    //     self.processes.iter_mut().map(|(&player_id, process)| {
    //         //(player_id, PlayerHandle::new(process))
    //         unimplemented!()
    //     }).collect()
    // }

    pub fn kill(mut self) {
        for handle in self.processes.values_mut() {
            handle.kill().expect("Couldn't kill bot");
        }
    }
}

pub struct BotHandle {
    process: Child,
    stdin: ChildStdin,
    stdout: ChildStdout,
}

impl Read for BotHandle {
    fn read(&mut self, buf: &mut [u8]) -> Result<usize> {
        self.stdout.read(buf)
    }
}

impl AsyncRead for BotHandle {}

impl Write for BotHandle {
    fn write(&mut self, buf: &[u8]) -> Result<usize> {
        self.stdin.write(buf)
    }

    fn flush(&mut self) -> Result<()> {
        self.stdin.flush()
    }
}

impl AsyncWrite for BotHandle {
    fn shutdown(&mut self) -> Poll<(), Error> {
        self.stdin.shutdown()
    }
}

impl BotHandle {
    pub fn spawn(mut command: Command, handle: &Handle) -> Result<BotHandle> {
        command
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .spawn_async(handle)
            .map(|process| BotHandle::new(process))
    }

    pub fn new(mut process: Child) -> BotHandle {
        BotHandle {
            stdin: process.stdin().take().unwrap(),
            stdout: process.stdout().take().unwrap(),
            process: process,
        }
    }
}


pub fn test() {
    let mut core = Core::new().unwrap();
    let mut cmd = Command::new("./test.sh");
    let bot = BotHandle::spawn(cmd, &core.handle()).unwrap();
}
