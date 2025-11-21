/**
 * Dashboard Schema Definition
 *
 * This file defines the complete dashboard layout using Punk's JSON schema format.
 * It demonstrates how to use the @punk/extended rig components:
 * - Chart: Data visualization with multiple chart types
 * - Table: Tabular data display with sorting and pagination
 * - Mermaid: Diagram rendering for system architecture
 */

export const dashboardSchema = {
  type: 'Container',
  props: {
    style: {
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    }
  },
  children: [
    // Header Section
    {
      type: 'Container',
      props: {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      },
      children: [
        {
          type: 'Text',
          props: {
            content: 'Punk Framework Dashboard',
            style: {
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }
          }
        },
        {
          type: 'Text',
          props: {
            content: 'Demonstrating @punk/extended rig with Chart, Table, and Mermaid components',
            style: {
              fontSize: '1.1rem',
              color: '#6b7280',
              marginTop: '0.5rem'
            }
          }
        }
      ]
    },

    // Charts Grid Section
    {
      type: 'Container',
      props: {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }
      },
      children: [
        // Bar Chart - Monthly Revenue
        {
          type: 'Container',
          props: {
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }
          },
          children: [
            {
              type: 'Text',
              props: {
                content: 'Monthly Revenue & Expenses',
                style: {
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }
              }
            },
            {
              type: 'Chart',
              props: {
                chartType: 'bar',
                data: 'monthlyRevenueData',
                options: {
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        font: {
                          size: 12,
                          weight: '500'
                        },
                        padding: 15
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      titleFont: {
                        size: 14,
                        weight: 'bold'
                      },
                      bodyFont: {
                        size: 13
                      },
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: 1
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      },
                      ticks: {
                        callback: function(value: any) {
                          return '$' + value + 'K'
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                },
                height: 300
              }
            }
          ]
        },

        // Line Chart - User Growth
        {
          type: 'Container',
          props: {
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }
          },
          children: [
            {
              type: 'Text',
              props: {
                content: 'User Growth Trends',
                style: {
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }
              }
            },
            {
              type: 'Chart',
              props: {
                chartType: 'line',
                data: 'userGrowthData',
                options: {
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        font: {
                          size: 12,
                          weight: '500'
                        },
                        padding: 15
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: 1
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                },
                height: 300
              }
            }
          ]
        },

        // Pie Chart - Traffic Sources
        {
          type: 'Container',
          props: {
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }
          },
          children: [
            {
              type: 'Text',
              props: {
                content: 'Traffic Sources',
                style: {
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }
              }
            },
            {
              type: 'Chart',
              props: {
                chartType: 'pie',
                data: 'trafficSourcesData',
                options: {
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        font: {
                          size: 12,
                          weight: '500'
                        },
                        padding: 12,
                        generateLabels: function(chart: any) {
                          const data = chart.data
                          if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label: string, i: number) => {
                              const value = data.datasets[0].data[i]
                              return {
                                text: `${label}: ${value}%`,
                                fillStyle: data.datasets[0].backgroundColor[i],
                                hidden: false,
                                index: i
                              }
                            })
                          }
                          return []
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      callbacks: {
                        label: function(context: any) {
                          return `${context.label}: ${context.parsed}%`
                        }
                      }
                    }
                  }
                },
                height: 300
              }
            }
          ]
        }
      ]
    },

    // Metrics Table Section
    {
      type: 'Container',
      props: {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      },
      children: [
        {
          type: 'Text',
          props: {
            content: 'Key Performance Metrics',
            style: {
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem'
            }
          }
        },
        {
          type: 'Table',
          props: {
            data: 'metricsTableData',
            columns: 'metricsTableColumns',
            enableSorting: true,
            enablePagination: true,
            pageSize: 5,
            style: {
              width: '100%',
              borderCollapse: 'collapse'
            }
          }
        }
      ]
    },

    // Architecture Diagrams Section
    {
      type: 'Container',
      props: {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }
      },
      children: [
        // System Architecture Diagram
        {
          type: 'Container',
          props: {
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }
          },
          children: [
            {
              type: 'Text',
              props: {
                content: 'System Architecture',
                style: {
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }
              }
            },
            {
              type: 'Mermaid',
              props: {
                diagram: 'systemArchitectureDiagram',
                theme: 'default',
                style: {
                  minHeight: '400px'
                }
              }
            }
          ]
        },

        // Data Flow Diagram
        {
          type: 'Container',
          props: {
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }
          },
          children: [
            {
              type: 'Text',
              props: {
                content: 'Data Flow Sequence',
                style: {
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }
              }
            },
            {
              type: 'Mermaid',
              props: {
                diagram: 'dataFlowDiagram',
                theme: 'default',
                style: {
                  minHeight: '400px'
                }
              }
            }
          ]
        }
      ]
    },

    // Footer
    {
      type: 'Container',
      props: {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      },
      children: [
        {
          type: 'Text',
          props: {
            content: 'Built with Punk Framework Extended Rig',
            style: {
              fontSize: '1rem',
              color: '#6b7280',
              marginBottom: '0.5rem'
            }
          }
        },
        {
          type: 'Text',
          props: {
            content: 'Powered by @punk/component-chart, @punk/component-table, and @punk/component-mermaid',
            style: {
              fontSize: '0.875rem',
              color: '#9ca3af',
              fontStyle: 'italic'
            }
          }
        }
      ]
    }
  ]
}
