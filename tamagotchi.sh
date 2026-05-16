#!/usr/bin/env bash
# Tamagotchi за терминал — чист bash, без зависимости.
# Работи на Termux (вкл. старата Google Play версия), Linux, macOS.
# Пускане:  bash tamagotchi.sh
# Клавиши:  h излюпи/погали  f храна  p игра  s сън  c баня  l лек  n ново  q изход
set -u

STATE="${TAMA_STATE:-$HOME/.tamagotchi_state}"

# ---- цветове (24-bit; Termux го поддържа) ----
e=$'\e'
BODY="${e}[38;2;194;121;92m"
EYE="${e}[38;2;29;29;29m"
TAIL="${e}[38;2;154;154;154m"
CRACK="${e}[38;2;107;63;46m"
DIM="${e}[38;2;140;138;130m"
OKC="${e}[38;2;111;168;74m"
WARN="${e}[38;2;211;155;43m"
BAD="${e}[38;2;207;76;63m"
RST="${e}[0m"

# ---- пиксел кадри (b=тяло e=око t=опашка k=пукнатина) ----
F_IDLE=(
"  bbbbbb      "
"  bbbbbb    tt"
" bbebbeb   tt "
" bbebbeb  tt  "
" bbbbbbbbtt   "
" bbbbbbbb     "
" b b b b      "
" b b b b      "
)
F_SAD=(
"  bbbbbb      "
"  bbbbbb      "
" bbebbeb      "
" bbebbeb      "
" bbbbbbbb     "
" bbbbbbbbtt   "
" b b b b  tt  "
" b b b b   tt "
)
F_SLEEP=(
"  bbbbbb      "
"  bbbbbb    tt"
" bbbbbbb   tt "
" bbbbbbb  tt  "
" bbbbbbbbtt   "
" bbbbbbbb     "
" b b b b      "
" b b b b      "
)
F_EGG=(
"    bbbb      "
"   bbbbbb     "
"  bbbbbbbb    "
"  bbbkkbbb    "
"  bbbbbbbb    "
"  bbkbbbbb    "
"   bbbbbb     "
"    bbbb      "
)

NAMES=(pixel bobo charlie zara mimi gosho luna toto)

# ---- състояние (показателите се пазят в centi: 0..10000) ----
name="" born=0 last=0 hatched=0 sleeping=0
hunger=8000 happy=8000 energy=8000 clean=9000 health=10000

now(){ date +%s; }

fresh(){
  name="${NAMES[$((RANDOM % ${#NAMES[@]}))]}"
  born=$(now); last=$(now)
  hunger=8000; happy=8000; energy=8000; clean=9000; health=10000
  hatched=0; sleeping=0
}

load(){
  [ -f "$STATE" ] || { fresh; return; }
  local k v
  while IFS='=' read -r k v; do
    case "$k" in
      name) name="$v";; born) born="$v";; last) last="$v";;
      hatched) hatched="$v";; sleeping) sleeping="$v";;
      hunger) hunger="$v";; happy) happy="$v";; energy) energy="$v";;
      clean) clean="$v";; health) health="$v";;
    esac
  done < "$STATE"
  [ -z "$name" ] && fresh
}

save(){
  local t="$STATE.tmp"
  {
    echo "name=$name";       echo "born=$born";   echo "last=$last"
    echo "hatched=$hatched"; echo "sleeping=$sleeping"
    echo "hunger=$hunger";   echo "happy=$happy";  echo "energy=$energy"
    echo "clean=$clean";     echo "health=$health"
  } > "$t" 2>/dev/null && mv -f "$t" "$STATE" 2>/dev/null
}

clamp(){ local v=$1; ((v<0))&&v=0; ((v>10000))&&v=10000; echo "$v"; }

# ---- ход във времето (по реалния часовник, вкл. докато е затворено) ----
tick(){
  local n dt; n=$(now); dt=$((n - last)); last=$n
  ((dt<0)) && dt=0
  ((hatched==0)) && return
  if ((dt==0)); then return; fi

  if ((sleeping==1)); then
    energy=$(clamp $((energy + 15*dt)))
    hunger=$(clamp $((hunger - 2*dt)))
    clean=$(clamp  $((clean  - 1*dt)))
    ((energy>=10000)) && { sleeping=0; MSG="добро утро"; }
  else
    hunger=$(clamp $((hunger - 8*dt)))
    happy=$(clamp  $((happy  - 6*dt)))
    energy=$(clamp $((energy - 4*dt)))
    clean=$(clamp  $((clean  - 4*dt)))
  fi

  local crit=0
  ((hunger==0)) && ((crit++))
  ((energy==0)) && ((crit++))
  ((clean<=500)) && ((crit++))
  ((happy==0)) && ((crit++))
  if ((crit>0)); then
    health=$(clamp $((health - crit*7*dt)))
  elif ((hunger>4500 && happy>4500 && clean>4000)); then
    health=$(clamp $((health + 4*dt)))
  fi
}

agetxt(){
  local s=$(( $(now) - born )) m h
  m=$((s/60)); h=$((m/60))
  if   ((m<60));  then echo "${m} мин"
  elif ((h<48));  then echo "${h} ч"
  else                 echo "$((h/24)) дни"; fi
}

# ---- настроение -> кадър + текст ----
FRAME=F_EGG; STATUS=""
mood(){
  local v=$((hunger/100)) ha=$((happy/100)) en=$((energy/100)) cl=$((clean/100)) he=$((health/100))
  if   ((hatched==0));        then FRAME=F_EGG;  STATUS="чука се отвътре... натисни h"
  elif ((sleeping==1));       then FRAME=F_SLEEP;STATUS="$name спи... (z Z)"
  elif ((he<30));             then FRAME=F_SAD;  STATUS="$name е болен! натисни l"
  elif ((cl<25));             then FRAME=F_SAD;  STATUS="тук мирише... баня (c)"
  elif ((v<25));              then FRAME=F_SAD;  STATUS="$name е гладен! (f)"
  elif ((en<20));             then FRAME=F_IDLE; STATUS="$name е изморен..."
  elif ((ha<25));             then FRAME=F_SAD;  STATUS="$name скучае... (p)"
  else
    local avg=$(((v+ha+en+cl)/4))
    if ((avg>75)); then FRAME=F_IDLE; STATUS="$name е щастлив <3"
    else                FRAME=F_IDLE; STATUS="$name се чувства добре"; fi
  fi
}

draw_pet(){
  local -n F=$FRAME
  local row out ch col
  for row in "${F[@]}"; do
    out="    "
    for ((col=0; col<${#row}; col++)); do
      ch="${row:col:1}"
      case "$ch" in
        b) out+="${BODY}██${RST}";;
        e) out+="${EYE}██${RST}";;
        t) out+="${TAIL}██${RST}";;
        k) out+="${CRACK}██${RST}";;
        *) out+="  ";;
      esac
    done
    printf '%s\n' "$out"
  done
}

bar(){ # $1 етикет  $2 centi
  local lbl="$1" v=$(( $2 / 100 )) n c i fill="" empty=""
  n=$(( (v+5)/10 )); ((n>10))&&n=10; ((n<0))&&n=0
  for ((i=0;i<n;i++));    do fill+='#';  done
  for ((i=n;i<10;i++));   do empty+='.'; done
  if   ((v>55)); then c=$OKC; elif ((v>25)); then c=$WARN; else c=$BAD; fi
  printf '%s%-7s%s [%s%s%s%s%s] %3d%%\n' \
    "$DIM" "$lbl" "$RST" "$c" "$fill" "$DIM" "$empty" "$RST" "$v"
}

MSG=""
render(){
  mood
  printf '%s' "${e}[H${e}[J"
  local agev="—"; ((hatched==1)) && agev=$(agetxt)
  printf '%s %s—%s %s\n\n' "$name" "$DIM" "$RST" "$agev"
  draw_pet
  printf '\n%s%s%s' "$DIM" "$STATUS" "$RST"
  [ -n "$MSG" ] && printf '   %s«%s»%s' "$BODY" "$MSG" "$RST"
  printf '\n\n'
  bar "глад"   "$hunger"
  bar "радост" "$happy"
  bar "сила"   "$energy"
  bar "чисто"  "$clean"
  bar "здраве" "$health"
  printf '\n%sh излюпи/погали  f храна  p игра  s сън  c баня  l лек  n ново  q изход%s\n' "$DIM" "$RST"
}

say(){ MSG="$1"; }

do_key(){
  local k="$1"
  if ((hatched==0)); then
    case "$k" in
      h) hatched=1; born=$(now); last=$(now); say "здравей, аз съм $name";;
      q) QUIT=1;;
      *) say "натисни h за излюпване";;
    esac
    return
  fi
  if ((sleeping==1)) && [[ "$k" != s && "$k" != l && "$k" != q && "$k" != n ]]; then
    say "шшт... спя"; return
  fi
  case "$k" in
    h) happy=$(clamp $((happy+600)));  say "хи-хи :)";;
    f) if ((hunger>=10000)); then say "сит съм"; else
         hunger=$(clamp $((hunger+3000))); happy=$(clamp $((happy+400)))
         clean=$(clamp $((clean-600)));  say "ам-ам"; fi;;
    p) if ((energy<1500)); then say "много съм уморен"; else
         happy=$(clamp $((happy+2800))); energy=$(clamp $((energy-1400)))
         hunger=$(clamp $((hunger-800))); say "ураа :)"; fi;;
    s) if ((sleeping==1)); then sleeping=0; say "будя се"
       else sleeping=1; say "лека нощ..."; fi;;
    c) if ((clean>=10000)); then say "вече съм чист"; else
         clean=$(clamp $((clean+5500))); happy=$(clamp $((happy+600)))
         say "чистичко"; fi;;
    l) if ((health>=10000)); then say "здрав съм"; else
         health=$(clamp $((health+4500))); happy=$(clamp $((happy-400)))
         say "по-добре съм"; fi;;
    n) fresh; say "свежо яйце";;
    q) QUIT=1;;
  esac
}

cleanup(){ printf '%s' "${e}[?25h${RST}"; save; }
trap 'cleanup; exit 0' INT TERM
trap cleanup EXIT

load
QUIT=0

# Тест-режим: едно изобразяване и изход (за проверка без интерактивен цикъл)
if [ "${TAMA_TEST:-0}" = "1" ]; then
  tick; render; exit 0
fi

printf '%s' "${e}[?25l"
while ((QUIT==0)); do
  tick
  render
  save
  if read -rsn1 -t 1 key; then
    do_key "$key"
  fi
done
