####################
# Init.            #
####################

# TODO: http://www.joshuad.net/zshrc-config/

# Define the place I store all my zsh config stuff
# local ZSH_CONF=$HOME/.zsh                      

# for storing files like history and zcompdump 
# local ZSH_CACHE=$ZSH_CONF/cache                

# Allow the local machine to have its own overriding zshrc if it wants it
# local LOCAL_ZSHRC=$HOME/.zshlocal/.zshrc       

source $ZPLUG_HOME//init.zsh 

# Load external config files and tools
#source $ZSH_CONF/functions.zsh              # Load misc functions. Done in a seperate file to keep this from getting too long and ugly
#source $ZSH_CONF/spectrum.zsh               # Make nice colors available

# TODO: Split up into separate files 
# source ~/dotfiles/.zenv
# source ~/dotfiles/.zprompt
# source ~/dotfiles/.zshfunc
# source ~/dotfiles/.zsh_keybind
# source ~/dotfiles/.zsh_aliases


###################
# Zplug Plugins   #
###################

zplug 'zplug/zplug', hook-build:'zplug --self-manage'

zplug "plugins/git", from:oh-my-zsh
zplug "scmbreeze/scm_breeze", defer:2

zplug "zsh-users/zsh-completions", defer:2
zplug "zsh-users/zsh-autosuggestions", defer:2
zplug "zsh-users/zsh-syntax-highlighting", defer:2
zplug "plugins/history-substring-search", from:oh-my-zsh, defer:2

zplug "seebi/dircolors-solarized", ignore:"*", as:plugin

zplug "djui/alias-tips"

#zplug "altercation/solarized", defer:2
#zplug "joel-porquet/zsh-dircolors-solarized", as:command

# Install plugins if there are plugins that have not been installed
if ! zplug check --verbose; then
    printf "Install? [y/N]: "
    if read -q; then
        echo; zplug install
    fi
fi


# Then, source plugins and add commands to $PATH
zplug load --verbose


####################
# Misc.            #
####################

# prevent duplicate entries in path
# declare -U path 


# ssh
# export SSH_KEY_PATH="~/.ssh/rsa_id"

# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"
alias dotfiles="/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME"

####################
# Powerline        #
####################

. "$HOME/.local/lib/python3.5/site-packages/powerline/bindings/zsh/powerline.zsh"

# Uses custom colors for LS, as outlined in dircolors

eval `dircolors ~/.themes/solarized/dircolors/dircolors.ansi-dark`
alias ls='ls --color=auto'

export TERM="xterm-256color"

#####################
# History Options:  #
#####################

# Keep 100000000 lines of history within the shell and save it to ~/.zsh_history:
HISTSIZE=1000000
SAVEHIST=1000000
HISTFILE=~/.zsh_history

# TODO: Add comments for what each does...
setopt EXTENDED_HISTORY HIST_EXPIRE_DUPS_FIRST HIST_IGNORE_DUPS HIST_IGNORE_ALL_DUPS HIST_IGNORE_SPACE HIST_FIND_NO_DUPS HIST_SAVE_NO_DUPS

#Append history to the history file (no overwriting)
setopt APPENDHISTORY     

# Add commands as they are typed, don't wait until shell exit 
setopt INC_APPEND_HISTORY

# Share history between sessions
setopt SHARE_HISTORY

#####################
#    Auto pushd:    #
#####################

# Set limits for allows dirs in pushd history
DIRSTACKSIZE=20

# Always pushd after dir change
setopt AUTOPUSHD

# Don't print dirs list after popd
# setopt PUSHDSILENT

# Swaps meaning of popd +3 & popd -3
#setopt PUSHDMINUS

# Ignore duplicate dirs in dirs list
setopt PUSHDIGNOREDUPS


#####################
# Auto-Completion   #
#####################

# If we have a glob, this expands it
setopt GLOB_COMPLETE

# Case-insensitive matching
setopt NO_CASE_GLOB	

# Auto-complete aliases
setopt NO_COMPLETE_ALIASES


# autosuggestions
# ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=136'
# ZSH_AUTOSUGGEST_CLEAR_WIDGETS=(do_enter kill-line $ZSH_AUTOSUGGEST_CLEAR_WIDGETS)

# Hub Shit
fpath=(~/.zsh/completions /home/dayfun/.zplug/autoload /home/dayfun/.zplug/misc/completions /home/dayfun/.zplug/base/sources /home/dayfun/.zplug/base/utils /home/dayfun/.zplug/base/job /home/dayfun/.zplug/base/log /home/dayfun/.zplug/base/io /home/dayfun/.zplug/base/core /home/dayfun/.zplug/base/base /home/dayfun/.zplug/autoload/commands /home/dayfun/.zplug/autoload/options /home/dayfun/.zplug/autoload/tags /home/dayfun/.oh-my-zsh/functions /home/dayfun/.oh-my-zsh/completions /usr/local/share/zsh/site-functions /usr/share/zsh/vendor-functions /usr/share/zsh/vendor-completions /usr/share/zsh/functions/Calendar /usr/share/zsh/functions/Chpwd /usr/share/zsh/functions/Completion /usr/share/zsh/functions/Completion/AIX /usr/share/zsh/functions/Completion/BSD /usr/share/zsh/functions/Completion/Base /usr/share/zsh/functions/Completion/Cygwin /usr/share/zsh/functions/Completion/Darwin /usr/share/zsh/functions/Completion/Debian /usr/share/zsh/functions/Completion/Linux /usr/share/zsh/functions/Completion/Mandriva /usr/share/zsh/functions/Completion/Redhat /usr/share/zsh/functions/Completion/Solaris /usr/share/zsh/functions/Completion/Unix /usr/share/zsh/functions/Completion/X /usr/share/zsh/functions/Completion/Zsh /usr/share/zsh/functions/Completion/openSUSE /usr/share/zsh/functions/Exceptions /usr/share/zsh/functions/MIME /usr/share/zsh/functions/Misc /usr/share/zsh/functions/Newuser /usr/share/zsh/functions/Prompts /usr/share/zsh/functions/TCP /usr/share/zsh/functions/VCS_Info /usr/share/zsh/functions/VCS_Info/Backends /usr/share/zsh/functions/Zftp /usr/share/zsh/functions/Zle /home/dayfun/.zplug/repos/zsh-users/zsh-completions/src)

eval alias git=hub

alias python='/usr/bin/python3'
alias pip='/usr/bin/pip3'

alias python2='/usr/bin/python2'
alias pip2='/usr/bin/pip2'



zstyle ':completion:*' auto-description 'specify: %d'
zstyle ':completion:*' menu select
zstyle ':completion:*:default' list-colors ${(s.:.)LS_COLORS}
#zstyle ':completion:*' list-colors $LS_COLORS'
zstyle ':completion:*' list-prompt %SAt %p: Hit TAB for more, or the character to insert%s
zstyle ':completion:*' matcher-list '' 'm:{a-z}={A-Z}' 'm:{a-zA-Z}={A-Za-z}' 'r:|[._-]=* r:|=* l:|=*'
zstyle ':completion:*:*:kill:*:processes' list-colors '=(#b) #([0-9]#)*=0=01;31'
zstyle ':completion:*:kill:*' command 'ps -u $USER -o pid,%cpu,tty,cputime,cmd'

# Rehash on the fly so new files in $PATH are found for auto-completion
zstyle ':completion:*' rehash true 

[ -s "/home/dayfun/.scm_breeze/scm_breeze.sh" ] && source "/home/dayfun/.scm_breeze/scm_breeze.sh"

# Use modern completion system
autoload -U compinit && compinit
