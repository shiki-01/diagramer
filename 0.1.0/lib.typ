#import "@preview/jogs:0.2.3": *
#import "@preview/pyrunner:0.2.0" as py

#let code = read("./lib.js")
#let bytecode = compile-js(code)

#let pycode = read("./lib.py")
#let pybytecode = py.compile(pycode)

#let diagramer(
  lang: auto,

  name: text,

  width: 100%,
  gap: 100pt,

  theme: "default",

  body
) = {
  let main = body.children.find((c) => c.func() == raw)
  let img = call-js-function(bytecode, "generateDiagram", main.text)
  img

  let py = py.call(pybytecode, "compress_and_encode", main.text)

  

  [
    \
    \
    \
    #let img2 = call-js-function(bytecode, "test", main.text)
    #img2
    \
    \
    #main.text\
    \
    \
    #link(py)
  ]
}

#diagramer(
  name: "Sequence Diagram",
  width: 50%,
  theme: "default",
)[
  ```
@startuml
Bob -> Alice : hello
@enduml
  ```
]
