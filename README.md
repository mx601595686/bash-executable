# bash-executable
为在Windows下的Bash文件在Git中添加可执行权限  
Add executable permissions for Bash files in Git under Windows environment

### 用法 | Usage
```
npm i bash-executable -g
```
```
用法：executable [options] [files]

例子：
    executable entrypoint.sh run.sh         为entrypoint.sh与run.sh添加执行权限

Options：
    -a                                      为仓库中所有bash文件添加执行权限
    -l                                      列出仓库中所有bash文件和可执行文件
    -f                                      找出仓库中所有没有执行权限的bash文件
```
```
Usage：executable [options] [files]

Examples：
    executable entrypoint.sh run.sh         Add execute permission for entrypoint.sh and run.sh

Options：
    -a                                      Add execute permission to all bash files in the repository
    -l                                      List all bash files and executable files in the repository
    -f                                      Find all bash files in the repository that do not have execute permission
```