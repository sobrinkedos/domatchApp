@echo off
echo Limpando arquivos temporarios...
if exist node_modules.tar del /f node_modules.tar
if exist node_modules rmdir /s /q node_modules
echo Instalando dependencias...
npm install
echo Pronto!
