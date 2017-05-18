source ~/.zplug/init.zsh

[[ -d ~/.zplug ]] || {
  curl -fLo ~/.zplug/zplug --create-dirs git.io/zplug
  source ~/.zplug/zplug
  zplug update --self
}

setopt histignorealldups sharehistory

# Use emacs keybindings even if our EDITOR is set to vi
# bindkey -e

# Keep 1000 lines of history within the shell and save it to ~/.zsh_history:
HISTSIZE=100000000
SAVEHIST=1000
HISTFILE=~/.zsh_history

# Use modern completion system
autoload -Uz compinit
compinit

#zstyle ':completion:*' auto-description 'specify: %d'
#zstyle ':completion:*' completer _expand _complete _correct _approximate
#zstyle ':completion:*' format 'Completing %d'
#zstyle ':completion:*' group-name ''
#zstyle ':completion:*' menu select=2
zstyle ':completion:*' menu select
eval "$(dircolors -b)"
zstyle ':completion:*:default' list-colors ${(s.:.)LS_COLORS}
zstyle ':completion:*' list-colors ''
zstyle ':completion:*' list-prompt %SAt %p: Hit TAB for more, or the character to insert%s
zstyle ':completion:*' matcher-list '' 'm:{a-z}={A-Z}' 'm:{a-zA-Z}={A-Za-z}' 'r:|[._-]=* r:|=* l:|=*'
# zstyle ':completion:*' menu select=long
# zstyle ':completion:*' select-prompt %SScrolling active: current selection at %p%s
# zstyle ':completion:*' use-compctl false
# zstyle ':completion:*' verbose true

zstyle ':completion:*:*:kill:*:processes' list-colors '=(#b) #([0-9]#)*=0=01;31'
zstyle ':completion:*:kill:*' command 'ps -u $USER -o pid,%cpu,tty,cputime,cmd'

zstyle ':prezto:module:utility:ls'    color 'yes'
zstyle ':prezto:module:utility:diff'  color 'yes'
zstyle ':prezto:module:utility:wdiff' color 'yes'
zstyle ':prezto:module:utility:make'  color 'yes'

zplug "robbyrussell/oh-my-zsh", use:"oh-my-zsh.sh",     defer:0
zplug "zsh-users/zsh-completions",                   defer:0
zplug "zsh-users/zsh-autosuggestions",               defer:2, on:"zsh-users/zsh-completions"
zplug "zsh-users/zsh-syntax-highlighting",           defer:3, on:"zsh-users/zsh-autosuggestions"
zplug "zsh-users/zsh-history-substring-search",      defer:3, on:"zsh-users/zsh-syntax-highlighting"
zplug "plugins/web-search", from:oh-my-zsh
zplug "lib/theme-and-appearance", from:oh-my-zsh

zplug "themes/clean", from:oh-my-zsh

### ZSH History config ###

setopt append_history
setopt hist_expire_dups_first
setopt hist_fcntl_lock
setopt hist_ignore_all_dups
setopt hist_lex_words
setopt hist_reduce_blanks
setopt hist_save_no_dups
setopt share_history

KEYTIMEOUT=1
bindkey -v

if zplug check zsh-users/zsh-history-substring-search; then
    bindkey '^[OA' history-substring-search-up
    bindkey '^[OB' history-substring-search-down
fi

# Install packages that have not been installed yet
if ! zplug check --verbose; then
    printf "Install? [y/N]: "
    if read -q; then
        echo; zplug install
    else
        echo
    fi
fi

zplug load --verbose

export EDITOR=/usr/bin/vim

export MANPATH=/usr/local/man:$MANPATH
export ANDROID_HOME=${HOME}/Android
export GRADLE_USER_HOME=${HOME}/.gradle/
export PYENV_ROOT=${HOME}/.pyenv
export GOPATH=${HOME}/go
export GOBIN=${HOME}/go/bin

# Change Java Versions

export JAVA9_HOME=/usr/lib/jvm/java-9-oracle
export JAVA8_HOME=/usr/lib/jvm/java-8-oracle
export JAVA_HOME=$JAVA8_HOME
export JDK_HOME=$JAVA8_HOME
 
function go9 {
    export JAVA_HOME=$JAVA9_HOME
    export JDK_HOME=$JAVA_HOME
    echo "Switched to $JAVA_HOME"
    export PATH="$JAVA_HOME/bin:$PATH"
}

function go8 {
    export JAVA_HOME=$JAVA8_HOME
    export JDK_HOME=$JAVA_HOME
    echo "Switched to $JAVA_HOME"
    export PATH="$JAVA_HOME/bin:$PATH"
}

export PATH=/opt/android-studio/bin:${ANDROID_HOME}/tools/bin:${ANDROID_HOME}/platform-tools:/usr/local/bin/studio:${HOME}/bin:${HOME}/Util/buck/bin/:${HOME}/Util/keychain-2.8.2/:${HOME}/Code_Complete/Util/genymotion/:${HOME}/bin/exercism:${HOME}/anaconda3/bin:${HOME}/.rbenv/bin:${HOME}/.rbenv/plugins/ruby-build/bin:${GOPATH}:${GOBIN}:${HOME}/anaconda3/bin:${PATH}

eval `keychain --eval --agents ssh lighthouse_id_rsa`

alias cc="cd ~/Code_Complete"
alias na="cd ~/Code_Complete/Notion/Android/notion-android"
alias nadb="~/Code_Complete/Notion/db-connect --env alpha"
alias nsdb="~/Code_Complete/Notion/db-connect --env staging"
alias npdb="~/Code_Complete/Notion/db-connect --env production"
alias util="cd ~/Util/"
alias gdriven="gdrive -c ~/.gdrive-notion"
alias sit="source ~/.zshrc"
alias ast="~/Code_Complete/Quality/ast.sh"
alias updateAll="sudo apt-get update && sudo apt-get upgrade && sudo apt-get dist-upgrade"
alias reboot="sudo reboot -f"
alias i3config="vim ~/.config/i3/config"

alias sagupdate="sudo apt-get update "
alias sagupgrade="sudo apt-get upgrade "
alias sagi="sudo apt-get install "
alias sagar="sudo apt-get autoremove "

alias dotfiles="/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME"

eval 'sh ${HOME}/.zplug/repos/randy909/base16-shell/base16-randy-darker.dark.sh'

# Init rbenv
if which rbenv > /dev/null; then eval "$(rbenv init -)"; fi

[ -s "/home/dayfun/.scm_breeze/scm_breeze.sh" ] && source "/home/dayfun/.scm_breeze/scm_breeze.sh"

#THIS MUST BE AT THE END OF THE FILE FOR SDKMAN TO WORK!!!
[[ -s "/home/dayfun/.sdkman/bin/sdkman-init.sh" ]] && source "/home/dayfun/.sdkman/bin/sdkman-init.sh"

